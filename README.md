🎨 media4u.ch – Digitale Kunstgalerie & High-End Webarchitektur
Willkommen bei media4u.ch. Dieses Monorepo vereint eine internationale Plattform für digitale Text-Kunst mit einer hochkomplexen Editor-Infrastruktur.

Entwickelt von Roman – Fullstack-Kompetenz mit Fokus auf resiliente Frontend-Architekturen.

📂 Projekt-Struktur
media4u.ch: Die produktive Galerie-Plattform. Fokus auf SEO, Performance und 24-fache Lokalisierung.

WebEditor: Das Herzstück des Projekts. Ein spezialisiertes Tool zur Erstellung komplexer ASCII- und SMS-Kunstwerke.

🏗️ Architektur-Philosophie
Das Projekt folgt dem Prinzip der "Framework-agnostischen DOM-Kontrolle". Während React das State-Management übernimmt, setzen wir für die rechenintensiven Kunst-Grids auf native Browser-APIs wie MutationObserver und ResizeObserver, um maximale Performance ohne unnötige Re-Renders zu garantieren.

🛡️ Der CI/CD "Gatekeeper"
Ein eigens entwickeltes PowerShell-basiertes Deployment-System (deploy.ps1) stellt sicher, dass kein Code live geht, der die Qualitätssicherung nicht besteht.

Automatisierter Workflow: Test-Validierung -> Build -> Artefakt-Swap via rsync.

Stabilität: Aktuell sichern 59 automatisierte Tests die Integrität der gesamten Plattform ab.