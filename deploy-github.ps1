param (
    [Parameter(Mandatory=$true)] [string]$Project,
    [Parameter(Mandatory=$true)] [string]$SshKeyPath
)

$ErrorActionPreference = "Stop"

# Pfad-Expansion für den SSH-Key
$ActualKeyPath = $ExecutionContext.InvokeCommand.ExpandString($SshKeyPath)
if (-not (Test-Path $ActualKeyPath)) { throw "SSH-Key nicht gefunden: $ActualKeyPath" }

# Mapping der Projekte
$RemoteBase = "/srv/media4u"
$RemotePaths = @{
    "frontend" = "$RemoteBase/site"
    "projekte" = "$RemoteBase/site/projekte"
    "editor"   = "$RemoteBase/site/editor"
    "werbung"  = "$RemoteBase/site/werbung"
    "diverses" = "$RemoteBase/site/diverses"
}

$LocalPath = if($Project -eq "frontend") { "media4u.ch" } else { $Project }
$TargetRemote = $RemotePaths[$Project]

if (-not $TargetRemote) { throw "Unbekanntes Projekt: $Project" }

Write-Host "==> Starte Deployment für: $Project" -ForegroundColor Cyan

# 1. Gatekeeper: Tests im Unterordner
Push-Location "$PSScriptRoot/$LocalPath"
try {
    npm install
    Write-Host "==> npm run test (Gatekeeper aktiv)"
    npm run test
    if ($LASTEXITCODE -ne 0) { throw "Tests fehlgeschlagen! Deployment abgebrochen." }

    # 2. Build erstellen
    Write-Host "==> npm run build"
    npm run build
} finally {
    Pop-Location
}

# 3. Paketierung
$stamp = Get-Date -Format "yyyyMMddHHmm"
$pkgName = "$Project-$stamp.tgz"
$localPkg = "$PSScriptRoot/$pkgName"

Write-Host "==> Verpacke Build..."
tar -C "$PSScriptRoot/$LocalPath/dist" -czf $localPkg .

# 4. Upload zum Server
Write-Host "==> Upload zu Server..."
scp -i "$ActualKeyPath" $localPkg "roman@46.231.205.201:$RemoteBase/"

# 5. Remote Swap (Robuste Kette ohne Zeilenumbruch-Probleme)
# Wir nutzen &&, damit der nächste Befehl nur ausgeführt wird, wenn der vorherige erfolgreich war.
$tmpDir = "tmp-$Project-new"
$remoteCmd = "cd $RemoteBase && " +
             "mkdir -p $TargetRemote $tmpDir && " +
             "rm -rf $tmpDir/* && " +
             "tar -xzf $pkgName -C $tmpDir && " +
             "rm $pkgName && " +
             "rsync -rltD --delete --omit-dir-times --no-perms --no-owner --no-group $tmpDir/ $TargetRemote/ && " +
             "rm -rf $tmpDir"

Write-Host "==> FÃ¼hre Remote-Swap aus..."
# Wir senden den Befehl als einen einzigen String ohne interne Zeilenumbrüche
ssh -i "$ActualKeyPath" "roman@46.231.205.201" $remoteCmd

if ($LASTEXITCODE -ne 0) { throw "Remote-Swap fehlgeschlagen!" }
Write-Host "OK: $Project erfolgreich deployt!" -ForegroundColor Green Force-Trigger: 04/27/2026 15:49:15
