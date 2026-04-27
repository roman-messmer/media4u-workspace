import React from 'react';
import SEO from './SEO'; // Import der SEO-Komponente
import metaData from './metaData.json'; // Import der Metadaten aus der JSON-Datei

function DynamicSEO({ page, lang = "en" }) {
  // Lade die Meta-Daten basierend auf Seite und Sprache, mit Englisch als Standard-Fallback
  const data = metaData.pages[page]?.[lang] || metaData.pages[page]?.en || {
    title: "Media4U – Modern Text Art with Textbild 2.0, SMS-Textbilder & ASCII-Movies",
    description: "Media4U combines Textbild 2.0, SMS-Textbilder, and ASCII-Movies into modern digital art. Available in 20 languages for creative communication and advertising opportunities worldwide!",
    keywords: "Textbild 2.0, SMS-Textbilder, ASCII-Movies, Digital Art, Creative Communication, International Advertising Spaces, Multilingual Website, Modern Text Art, Art and Technology, JavaScript and React, Creative Advertising, Digital Experiences, Innovative Art Formats, Media4U Website, 20 Languages"
  };

  return (
    <SEO
      title={data.title}
      description={data.description}
      keywords={data.keywords}
      lang={lang}
    />
  );
}

export default DynamicSEO;
