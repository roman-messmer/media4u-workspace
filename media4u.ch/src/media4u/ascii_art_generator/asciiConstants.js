// asciiConstants.js
export const ASCII_RAMPS = {
  standard: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  simple: "@%#*+=-:. ",
};

export const FONTS = {
  system: { name: 'System Mono', family: '"Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace' },
  courier: { name: 'Courier New', family: '"Courier New", Courier, monospace' },
  // ... (Rest der Fonts aus deinem Originalcode)
};

export const LANGUAGES = {
  de: "Deutsch", en: "English", // ... (Rest der Sprachen)
};

export const BASE_TRANSLATION = {
    app_title: "ASCII Art Generator", app_subtitle: "Created by MEDIA4U.CH", // ...
};

export const TRANSLATIONS = {
  en: BASE_TRANSLATION,
  de: { ...BASE_TRANSLATION, app_title: "ASCII-Art Generator" /* ... */ },
  // ... (Rest der Übersetzungen aus deinem Originalcode)
};