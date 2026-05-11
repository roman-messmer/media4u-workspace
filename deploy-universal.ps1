<#
.SYNOPSIS
  Universal Deployment Script für Media4u (Lokal & GitHub Actions)
.DESCRIPTION
  Erkennt die Umgebung automatisch. Baut React/Vite Projekte, 
  verpackt sie sicher und überträgt sie via rsync (Swap) auf den Server.
#>

param(
    [string]$Project,
    [string]$SshKeyPath = "$HOME/.ssh/id_rsa"
)

$ErrorActionPreference = 'Stop'

$Server = "46.231.205.201"
$User   = "roman"
$RemoteBase = "/srv/media4u"
$RemoteSite = "$RemoteBase/site"

# ---------------------------------------------------------
# 1. UMGEBUNGSERKENNUNG & PROJEKTAUSWAHL
# ---------------------------------------------------------
$IsGitHub = [bool]$env:GITHUB_ACTIONS
Write-Host "==> Laufzeit-Umgebung: $(if($IsGitHub){'GitHub Actions (Cloud)'} else {'Lokal (Windows)'})" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($Project)) {
    if ($IsGitHub) { throw "FEHLER: Projekt-Parameter fehlt in GitHub Action!" }
    
    # Lokales Menü öffnen, wenn kein Parameter übergeben wurde
    $verfuegbareProjekte = @("frontend", "projekte", "editor", "werbung", "diverses")
    $Project = $verfuegbareProjekte | Out-GridView -Title "Wähle das Projekt für das Deployment" -OutputMode Single
    
    if (-not $Project) { 
        Write-Host "Abbruch durch Benutzer." -ForegroundColor Yellow
        exit 0 
    }
}

# Pfade zuweisen (Frontend hat einen abweichenden Ordnernamen)
$LocalDir = if ($Project -eq "frontend") { "media4u.ch" } else { $Project }
$FullLocalPath = Join-Path $PSScriptRoot $LocalDir
$TargetRemote = if ($Project -eq "frontend") { $RemoteSite } else { "$RemoteSite/$Project" }

if (-not (Test-Path $FullLocalPath)) { throw "Ordner nicht gefunden: $FullLocalPath" }

# ---------------------------------------------------------
# 2. BUILD PROZESS & GATEKEEPER
# ---------------------------------------------------------
Push-Location $FullLocalPath
try {
    if (Test-Path "package.json") {
        Write-Host "==> Installiere Abhängigkeiten für $Project..." -ForegroundColor Cyan
        if (-not (Test-Path "node_modules")) { npm ci } else { npm install }
        
        Write-Host "==> Führe Tests aus (Gatekeeper)..." -ForegroundColor Cyan
        npm test --if-present
        if ($LASTEXITCODE -ne 0) { throw "FEHLER: Tests fehlgeschlagen! Deployment abgebrochen, um die Live-Seite zu schützen." }

        Write-Host "==> Erstelle Produktions-Build..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "FEHLER: Build fehlgeschlagen!" }
    } else {
        Write-Host "==> Kein package.json gefunden. Verarbeite als statisches Projekt." -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

# ---------------------------------------------------------
# 3. SENIOR-SICHERHEITSCHECK & PAKETIERUNG
# ---------------------------------------------------------
$SourcePath = if (Test-Path "$FullLocalPath/dist") { "$FullLocalPath/dist" }
              elseif (Test-Path "$FullLocalPath/build") { "$FullLocalPath/build" }
              else { $FullLocalPath }

# Verhindert 403-Fehler, indem das Löschen bei leerem Build blockiert wird
if ((Get-ChildItem $SourcePath).Count -eq 0) {
    throw "ABBRUCH: Der Ordner '$SourcePath' ist leer! Deployment wurde gestoppt, um einen Ausfall der Live-Seite zu verhindern."
}

$Stamp = Get-Date -Format "yyyyMMddHHmm"
$PkgName = "$Project-$Stamp.tgz"
$LocalPkg = Join-Path $env:TEMP $PkgName

Write-Host "==> Verpacke Daten aus $SourcePath..." -ForegroundColor Cyan
tar -C "$SourcePath" -czf $LocalPkg .
if ($LASTEXITCODE -ne 0) { throw "FEHLER: Verpacken mit tar fehlgeschlagen!" }

# ---------------------------------------------------------
# 4. TRANSFER & SERVER SWAP
# ---------------------------------------------------------
# Authentifizierung vorbereiten (auf GitHub mit Key, Lokal nach System-Standard)
$SshAuth = if ($IsGitHub -and (Test-Path $SshKeyPath)) { @("-i", $SshKeyPath) } else { @() }

# Excludes schützen Unterordner, wenn das Haupt-Frontend deployt wird
$Excludes = if ($Project -eq "frontend") {
    "--exclude=/projekte/** --exclude=/editor/** --exclude=/werbung/** --exclude=/diverses/** --exclude=/projekte --exclude=/editor --exclude=/werbung --exclude=/diverses"
} else { "" }

$RemoteScript = @"
set -e
TARGET="$TargetRemote"
PKG="$RemoteBase/$PkgName"
TMP="\`$TARGET-tmp-new"

[ -f "\`$PKG" ] || { echo "FEHLER: Paket nicht gefunden auf Server"; exit 1; }

mkdir -p "\`$TARGET" "\`$TMP"
rm -rf "\`$TMP"/*
tar -xzf "\`$PKG" -C "\`$TMP"
rm -f "\`$PKG"

if command -v rsync >/dev/null 2>&1; then
    rsync -rltD --delete --omit-dir-times --no-perms --no-owner --no-group $Excludes "\`$TMP"/ "\`$TARGET"/
else
    cp -a "\`$TMP"/. "\`$TARGET"/
fi

rm -rf "\`$TMP"

if [ -d "$RemoteBase" ] && [ "$Project" == "frontend" ]; then
    cd "$RemoteBase"
    docker compose up -d --force-recreate frontend || true
fi
"@

Write-Host "==> Lade Paket auf Server hoch..." -ForegroundColor Cyan
& scp @SshAuth $LocalPkg "${User}@${Server}:${RemoteBase}/"
if ($LASTEXITCODE -ne 0) { throw "FEHLER: Upload per scp fehlgeschlagen!" }

Write-Host "==> Führe Remote-Swap aus..." -ForegroundColor Cyan
# Zeilenumbrüche für Linux korrigieren
$LfScript = ($RemoteScript -replace "`r`n", "`n") -replace "`r", ""
$B64Script = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($LfScript))
& ssh @SshAuth "${User}@${Server}" "bash -lc 'set -e; umask 022; echo $B64Script | base64 -d | bash'"
if ($LASTEXITCODE -ne 0) { throw "FEHLER: Server-Befehle fehlgeschlagen!" }

Remove-Item -Force $LocalPkg -ErrorAction SilentlyContinue
Write-Host "🚀 OK: $Project wurde erfolgreich und sicher deployt!" -ForegroundColor Green