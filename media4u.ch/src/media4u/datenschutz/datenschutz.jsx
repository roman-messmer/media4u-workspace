// src/components/pages/Datenschutz.jsx
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const Datenschutz = () => {
  // Namespace auf 'datenschutz' gesetzt
  const { t, i18n } = useTranslation('datenschutz');
  const lang = i18n?.language?.split('-')[0] || 'de';

  // Observer für Animationen initialisieren
  useEffect(() => {
    const cleanup = observeVisibility({ once: true });
    return cleanup;
  }, [lang]);

  // JSON-Array auslesen, zusammensetzen und gegen XSS absichern
  const safeHtml = useMemo(() => {
    const contentArray = t('datenschutz_content', { returnObjects: true });
    const rawHtml = Array.isArray(contentArray) ? contentArray.join(' ') : (contentArray || '');
    
    return sanitizeHtml(rawHtml);
  }, [t]);

  return (
    <>
      <DynamicSEO page="datenschutz" lang={lang} />
      
      {/* Semantischer Wrapper für die Datenschutzerklärung */}
      <article 
        className="datenschutz-page" 
        aria-busy="false" 
        aria-live="polite"
        dangerouslySetInnerHTML={{ __html: safeHtml }} 
      />
    </>
  );
};

export default Datenschutz;