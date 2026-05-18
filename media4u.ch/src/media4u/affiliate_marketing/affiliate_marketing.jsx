import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";
import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const AffiliateMarketing = () => {
  const { t, i18n } = useTranslation('affiliate');
  const lang = i18n?.language?.split('-')[0] || 'de';

  // Observer für CSS-Animationen bei Sprachwechsel neu initialisieren
  useEffect(() => {
    const cleanup = observeVisibility({ once: true });
    return cleanup;
  }, [lang]);

  // JSON-Array auslesen, zusammensetzen und gegen XSS absichern
  const safeHtml = useMemo(() => {
    const contentArray = t('affiliate_marketing_content', { returnObjects: true });
    const rawHtml = Array.isArray(contentArray) ? contentArray.join(' ') : (contentArray || '');
    
    return sanitizeHtml(rawHtml);
  }, [t]);

  return (
    <>
      <DynamicSEO page="affiliate_marketing" lang={lang} />
      
      {/* Semantischer Wrapper ersetzt das überflüssige div und doppelte main */}
      <section 
        className="affiliate-marketing-page" 
        aria-busy="false" 
        aria-live="polite"
        dangerouslySetInnerHTML={{ __html: safeHtml }} 
      />
    </>
  );
};

export default AffiliateMarketing;