import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Sucht jetzt auch in allen Unterordnern nach JSON-Dateien
const translationFiles = import.meta.glob('./translations/**/*.json', { eager: true });

const resources = {};

Object.entries(translationFiles).forEach(([path, module]) => {
  // 2. Extrahiert die Sprache (Ordner) und den Namespace (Dateiname ohne .json)
  // Beispiel Pfad: "./translations/de/common.json" -> lang: "de", ns: "common"
  const match = path.match(/\.\/translations\/(.+)\/(.+)\.json$/);
  
  if (match) {
    const lang = match[1];
    const ns = match[2];

    // Erstelle das Sprach-Objekt, falls es noch nicht existiert
    if (!resources[lang]) {
      resources[lang] = {};
    }
    
    // Weise den Inhalt der JSON-Datei dem korrekten Namespace zu
    resources[lang][ns] = module.default;
  }
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    // 3. WICHTIG: Definiert deine Hauptdatei (ehemals de.json) als Standard
    defaultNS: 'common', 
    lng: localStorage.getItem('language') || 'de',
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
  });

i18n.on('languageChanged', (lng) => {
  console.log(`Sprache geändert zu: ${lng}`);
  localStorage.setItem('language', lng);
});

export default i18n;