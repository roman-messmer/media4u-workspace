⚙️ media4u WebEditor – Technical Deep Dive
Der WebEditor ist das technische Kraftzentrum von media4u.ch. Er ermöglicht die präzise Erstellung komplexer Text-Kunstwerke durch eine intuitive, technologisch anspruchsvolle Oberfläche.

🧠 Engineering-Highlights
Consolidated UI Architecture: Radikale Umsetzung des DRY-Prinzips. Die Steuerung aller Editor-Varianten erfolgt über eine einzige, hoch-konfigurierbare Console.jsx, was die technische Schuld minimiert und die Wartbarkeit maximiert.

Grid-Engine: Dynamische Berechnung von Grid-Positionen und Spans in Echtzeit innerhalb der Textbild2Page.jsx.

Persistence Layer: Nutzung des usePersistentEditor Hooks zur versionierten Speicherung von Entwürfen im LocalStorage inklusive automatischer Normalisierungs-Logik für Legacy-Daten.

🧪 Testing-Strategie (100% Coverage)
Der Editor wird durch insgesamt 59 Tests (Unit- & Integrationstests) geschützt.

Integrationstests: Dedizierte Tests für Textbild2Page.test.jsx und SmsTextbildPage.test.jsx validieren die komplette Orchestrierung von Actions wie move, clone, new und align.

DOM-Validierung: Die Tests nutzen JSDOM, um komplexe Selektoren wie getSelectedItemIndices abzusichern, die direkt auf die DOM-Struktur zugreifen.

Barrierefreiheit: Jeder Test validiert die korrekte Setzung von ARIA-Labels und Rollen sowie die Funktion von Fokus-Traps in Dialogen.

🚀 Workflow & Sicherheit
State-Management: Ein hybrider Ansatz aus React-Zustand für UI-Toggles und Business-Logik für die Inhaltsmanipulation.

Sanitization: Konsequente Nutzung von DOMPurify vor jedem Rendering mit dangerouslySetInnerHTML, um XSS-Angriffe auszuschließen.