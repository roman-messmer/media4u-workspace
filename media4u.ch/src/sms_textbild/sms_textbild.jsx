// SmsTextbild.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzungen
import Beispiel_Sms_Textbild from "../module/beispiel_sms_textbild/beispiel_sms_textbild";
import "../css/sms_textbild.css";
import "../css/ZoomIn.css";
import DynamicSEO from '../module/DynamicSEO'; // Import der DynamicSEO-Komponente

import sms_textbild_nokia from '../assets/sms_textbild_nokia.png';

import { useVisibilityObserver } from '../script/useVisibilityObserver';

const SmsTextbild = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  useVisibilityObserver();

  return (
    <>
    {/* SEO-Komponente für die Seite */}
    <DynamicSEO page="sms_textbild" lang={lang} />

      <h1>{t('sms_textbild.title')}</h1>
      <div className="display_area zoom-in">
        <Beispiel_Sms_Textbild />
      </div>
      <h2>{t('sms_textbild.h1')}</h2>
      <p>{t('sms_textbild.p1')}</p>
      <p>{t('sms_textbild.p2')}</p>
      <img src={sms_textbild_nokia} alt="SMS-Textbild Nokia" className="responsive-image zoom-in" />
      <h2>{t('sms_textbild.h2')}</h2>
      <p>{t('sms_textbild.p3')}</p>
      <h2>{t('sms_textbild.h3')}</h2>
      <p>{t('sms_textbild.p4')}</p>
      <h2>{t('sms_textbild.h4')}</h2>
      <p>{t('sms_textbild.p5')}</p>
      
    </>
  );
};

export default SmsTextbild;
