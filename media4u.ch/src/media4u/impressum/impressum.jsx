// src/components/pages/Impressum.jsx
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const Impressum = () => {
  // Namespace auf 'impressum' gesetzt
  const { t, i18n } = useTranslation('impressum');
  const lang = i18n?.language?.split('-')[0] || 'de';

  // Observer für Animationen initialisieren
  useEffect(() => {
    const cleanup = observeVisibility({ once: true });
    return cleanup;
  }, [lang]);

  // JSON-Array auslesen, zusammensetzen und gegen XSS absichern
  const safeHtml = useMemo(() => {
    const contentArray = t('impressum_content', { returnObjects: true });
    const rawHtml = Array.isArray(contentArray) ? contentArray.join(' ') : (contentArray || '');
    
    return sanitizeHtml(rawHtml);
  }, [t]);

  return (
    <>
      <DynamicSEO page="impressum" lang={lang} />
      
      {/* Semantischer Wrapper, in den der gereinigte HTML-Block injiziert wird */}
      <section 
        className="impressum-page" 
        aria-busy="false" 
        aria-live="polite"
        dangerouslySetInnerHTML={{ __html: safeHtml }} 
      />
    </>
  );
};

export default Impressum;