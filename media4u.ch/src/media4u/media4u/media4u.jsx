// src/components/pages/Media4u.jsx
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const Media4u = () => {
  // Namespace auf 'media4u' gesetzt
  const { t, i18n } = useTranslation('media4u');
  const lang = i18n?.language?.split('-')[0] || 'de';

  // Observer für die Zoom-In Animationen initialisieren
  useEffect(() => {
    const cleanup = observeVisibility({ once: true });
    return cleanup;
  }, [lang]);

  // JSON-Array auslesen, zusammensetzen und gegen XSS absichern
  const safeHtml = useMemo(() => {
    const contentArray = t('media4u_content', { returnObjects: true });
    const rawHtml = Array.isArray(contentArray) ? contentArray.join(' ') : (contentArray || '');
    
    return sanitizeHtml(rawHtml);
  }, [t]);

  return (
    <>
      <DynamicSEO page="media4u" lang={lang} />
      
      {/* Semantisches Main-Tag, in das der gesamte HTML-Block injiziert wird */}
      <main 
        className="media4u" 
        aria-busy="false" 
        aria-live="polite"
        dangerouslySetInnerHTML={{ __html: safeHtml }} 
      />
    </>
  );
};

export default Media4u;