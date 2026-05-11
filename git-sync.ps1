<# 
  Media4u – Schnelle Git-Synchronisation (Resilient Version)
  Führt add, commit und push in einem Schritt aus.
#>

$ErrorActionPreference = 'Stop'

# Automatische Pfad-Findung für Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $GitPath = "C:\Program Files\Git\cmd\git.exe"
    if (Test-Path $GitPath) {
        function git { & $GitPath $args }
    } else {
        throw "Git wurde weder im PATH noch unter $GitPath gefunden."
    }
}

# 1. Änderungen erfassen
Write-Host "==> Erfasse Aenderungen..." -ForegroundColor Cyan
git add .

# 2. Commit-Nachricht abfragen
$msg = Read-Host "Commit-Nachricht (leer lassen fuer Standard-Text)"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "chore: automatisierte Synchronisation der Projektdateien"
}

# 3. Lokal speichern
Write-Host "==> Erstelle Commit..." -ForegroundColor Cyan
git commit -m "$msg"

# 4. Zu GitHub hochladen
Write-Host "==> Push zu GitHub (main)..." -ForegroundColor Cyan
git push origin main

Write-Host "DONE: Alles erfolgreich auf GitHub hochgeladen!" -ForegroundColor Green