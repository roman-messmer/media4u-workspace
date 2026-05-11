# 🎨 media4u.ch – Digitale Kunstgalerie & High-End Webarchitektur

Willkommen bei media4u.ch. Dieses Monorepo vereint eine internationale Plattform für digitale Text-Kunst mit einer hochkomplexen Editor-Infrastruktur.

Entwickelt von Roman – Fullstack-Kompetenz mit Fokus auf resiliente Frontend-Architekturen.

## 📂 Projekt-Struktur
* **media4u.ch:** Die produktive Galerie-Plattform. Fokus auf SEO, Performance und 24-fache Lokalisierung.
* **WebEditor:** Das Herzstück des Projekts. Ein spezialisiertes Tool zur Erstellung komplexer ASCII- und SMS-Kunstwerke.

## 🏗️ Architektur-Philosophie
Das Projekt folgt dem Prinzip der **"Framework-agnostischen DOM-Kontrolle"**. Während React das State-Management übernimmt, setzen wir für die rechenintensiven Kunst-Grids auf native Browser-APIs wie `MutationObserver` und `ResizeObserver`, um maximale Performance ohne unnötige Re-Renders zu garantieren.

Die Infrastruktur nutzt eine **native Host-NGINX-Architektur** für maximale Performance bei statischen Dateien und eine strikte Subdomain-Isolation.

## 🛡️ Der CI/CD "Gatekeeper"
Ein zentrales Deployment-System (`deploy-universal.ps1`) stellt sicher, dass kein Code live geht, der die Qualitätssicherung nicht besteht.

**Automatisierter Workflow:**
0.  **Git-Synchronisation:** Schneller Upload via `git-sync.ps1` (Add -> Commit -> Push).
1.  **Umgebungserkennung:** Automatische Unterscheidung zwischen lokaler Windows-Ebene und GitHub Actions.
2.  **Test-Validierung:** Build-Stop bei fehlerhaften Tests zum Schutz der Live-Seite.
3.  **Sichere Paketierung:** Erstellung von `.tgz`-Artefakten inklusive Timestamp.
4.  **Zero-Downtime Swap:** Differenzielle Übertragung via `rsync` und sauberer Austausch der Produktionsdaten.

Stabilität: Aktuell sichern 59 automatisierte Tests die Integrität der gesamten Plattform ab.