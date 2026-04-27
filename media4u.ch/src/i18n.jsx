import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Alle JSON-Dateien aus dem Ordner laden
const translationFiles = import.meta.glob('./translations/*.json', { eager: true });

const resources = {};

Object.entries(translationFiles).forEach(([path, module]) => {
  const lang = path.match(/\.\/translations\/(.*)\.json$/)[1];
  resources[lang] = { translation: module.default };
});

i18n
  .use(initReactI18next)
  .init({
    resources,
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
