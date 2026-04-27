import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzungen
import BeispielAsciiArtFilm from '../module/beispiel_ascii_art_film/beispiel_ascii_art_film';
import "../css/ascii_art_film.css";
import "../css/ZoomIn.css";
import DynamicSEO from '../module/DynamicSEO'; // Import der DynamicSEO-Komponente

import { useVisibilityObserver } from '../script/useVisibilityObserver';

const AsciiArtFilm = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  useVisibilityObserver ();

  return (
    <div className="ascii_art_film">
      {/* SEO-Komponente für die Seite */}
      <DynamicSEO page="ascii_art_film" lang={lang} />

      <h1>{t('ascii_art_film.title')}</h1>
      <div className="zoom-in"><BeispielAsciiArtFilm /></div>
      <h2>{t('ascii_art_film.h1')}</h2>
      <p>{t('ascii_art_film.p1')}</p>
      <h2>{t('ascii_art_film.h2')}</h2>
      <p>{t('ascii_art_film.p2')}</p>
      <p>{t('ascii_art_film.p3')}</p>
    </div>
  );
};

export default AsciiArtFilm;