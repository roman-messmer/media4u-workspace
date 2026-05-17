import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";
import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const AffiliateMarketing = () => {
  // Wir laden spezifisch den neuen Namespace 'affiliate'
  const { t, i18n } = useTranslation('affiliate');
  const lang = i18n?.language?.split('-')[0] || 'de';

  // Beobachter für die Zoom-In Animation des Bildes neu starten
  useEffect(() => {
    const cleanup = observeVisibility({ once: true });
    return cleanup;
  }, [lang]); // Startet neu, falls die Sprache gewechselt wird

  // HTML aus der JSON laden, zusammenfügen und sicher machen (XSS Schutz)
  const safeHtml = useMemo(() => {
    // Holt das Array aus der affiliate.json
    const contentArray = t('affiliate_marketing_content', { returnObjects: true });
    
    // Fügt die Zeilen zusammen (oder nutzt den String, falls es noch kein Array ist)
    const rawHtml = Array.isArray(contentArray) ? contentArray.join(' ') : (contentArray || '');
    
    return sanitizeHtml(rawHtml);
  }, [t]);

  return (
    <>
      {/* SEO Metadaten bleiben dynamisch */}
      <DynamicSEO page="affiliate_marketing" lang={lang} />

      {/* Da unser JSON-Array bereits das <main class="affiliate-marketing-page"> Tag enthält,
        rendern wir das sichere HTML einfach in einen simplen Wrapper.
        Ladebalken oder Fehleranzeigen brauchen wir hier nicht mehr.
      */}
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </>
  );
};

export default AffiliateMarketing;