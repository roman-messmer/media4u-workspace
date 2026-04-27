import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzung
import "../../css/media4u.css"
import DynamicSEO from '../../module/DynamicSEO'; // Import der DynamicSEO-Komponente

const Cookie = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  return (
    <div>
      {/* SEO-Komponente für die Seite */}
      <DynamicSEO page="media4u" lang={lang} />
      
      {t('cookie.content')} {/* Zeigt den übersetzten Text an */}
    </div>
  );
};

export default Cookie;