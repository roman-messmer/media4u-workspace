// Textbild2.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzungen
import "../css/textbild2.css";
import "../css/ZoomIn.css";
import Beispiel_Textbild2 from "../module/beispiel_textbild2/beispiel_textbild2";
import DynamicSEO from '../module/DynamicSEO'; // Import der DynamicSEO-Komponente

import textbild_2_0 from '../assets/textbild_2_0.png';

import { useVisibilityObserver } from '../script/useVisibilityObserver.jsx';

const Textbild2 = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  useVisibilityObserver();

  return (
    <>
    {/* SEO-Komponente für die Seite */}
    <DynamicSEO page="textbild2" lang={lang} />

      <h1 >{t('textbild2.title')}</h1>
      <div className="display_area zoom-in">
        <Beispiel_Textbild2 />
      </div>
      <h2>{t('textbild2.h1')}</h2>
      <p>{t('textbild2.p1')}</p>
      <p>{t('textbild2.p2')}</p>
      <img src={textbild_2_0} alt="Textbild 2.0" className="responsive-image zoom-in" />
      <h2>{t('textbild2.h2')}</h2>
      <p>{t('textbild2.p3')}</p>
      <h2>{t('textbild2.h3')}</h2>
      <p>{t('textbild2.p4')}</p>
      <h2>{t('textbild2.h4')}</h2>
      <p>{t('textbild2.p5')}</p>
    </>
  );
};

export default Textbild2;