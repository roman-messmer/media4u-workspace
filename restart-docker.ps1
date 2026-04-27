<# Media4u – Remote Docker Control (mit Status-Anzeige)
   Menü-gesteuertes Starten und Stoppen der Docker-Container auf dem Server.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Server-Konfiguration
$Server        = "46.231.205.201"
$User          = "roman"
$RemoteCompose = "/srv/media4u/deploy"

# --- Hilfsfunktionen ---

# Zeigt eine saubere Tabelle der aktuellen Container an
function Show-DockerStatus {
    Write-Host "Aktueller Container-Status:" -ForegroundColor DarkCyan
    # Holt die Namen, den Status und die Ports als formatierte Tabelle
    & ssh ("{0}@{1}" -f $User, $Server) "cd $RemoteCompose && docker compose ps --format `"table {{.Name}}`t{{.Status}}`t{{.Ports}}`""
    Write-Host ""
}

# Führt den eigentlichen Docker-Befehl aus
function Invoke-DockerCommand([string]$Command, [string]$Message) {
    Write-Host "==> $Message..." -ForegroundColor Yellow
    & ssh ("{0}@{1}" -f $User, $Server) "cd $RemoteCompose && $Command"
    
    if ($LASTEXITCODE -ne 0) { 
        throw "Fehler bei der Ausfuehrung von: $Command" 
    }
}

function Show-DockerMenu {
    Write-Host "=== Media4u Docker Control ($User@$Server) ===" -ForegroundColor White
    Write-Host "1) Alle STARTEN   (Zeigt Status danach)"
    Write-Host "2) Alle STOPPEN   (Zeigt Status davor)"
    Write-Host "3) NEUSTART       (Stoppt alles & startet neu)"
    Write-Host "0) Beenden"
    Write-Host "==============================================" -ForegroundColor White
    Write-Host ""
}

# --- Hauptprogramm ---

try {
    do {
        Show-DockerMenu
        $choice = Read-Host "Deine Wahl"
        Write-Host ""
        
        switch($choice) {
            '1' { 
                Invoke-DockerCommand "docker compose up -d --remove-orphans" "Starte alle Container"
                Write-Host ""
                Show-DockerStatus
                Write-Host "OK: Container erfolgreich gestartet!" -ForegroundColor Green
            }
            '2' { 
                Show-DockerStatus
                Invoke-DockerCommand "docker compose down" "Stoppe und entferne obige Container" 
                Write-Host "OK: Container erfolgreich gestoppt und abgeraeumt!" -ForegroundColor Green
            }
            '3' { 
                Show-DockerStatus
                Invoke-DockerCommand "docker compose down" "Stoppe Container fuer Neustart"
                Write-Host ""
                Invoke-DockerCommand "docker compose up -d --remove-orphans" "Starte Container neu" 
                Write-Host ""
                Show-DockerStatus
                Write-Host "OK: Neustart erfolgreich abgeschlossen!" -ForegroundColor Green
            }
            '0' { 
                Write-Host "Auf Wiedersehen!" 
                break 
            }
            default { 
                Write-Host "Ungueltige Eingabe. Bitte waehle 1, 2, 3 oder 0." -ForegroundColor Red 
            }
        }
        Write-Host ""
    } while ($choice -ne '0')
}
catch {
    Write-Host ("ERROR: {0}" -f $_.Exception.Message) -ForegroundColor Red
    exit 1
}