import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzung
import "../../css/media4u.css";
import "../../css/ZoomIn.css";
import DynamicSEO from '../../module/DynamicSEO'; // Import der DynamicSEO-Komponente

import { useVisibilityObserver } from '../../script/useVisibilityObserver';

const Datenschutz = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  useVisibilityObserver();

  return (
    <div>
      {/* SEO-Komponente für die Seite */}
      <DynamicSEO page="media4u" lang={lang} />

<h1>{t('datenschutz.title')}</h1>

<p>{t('datenschutz.title_p')}</p>

<h2>{t('datenschutz.verantwortlicher_für_die_datenverarbeitung')}</h2>
<ul>
  <li>Roman Messmer</li>
  <li>Haldenweg 1</li>
  <li>8180 Bülach</li>
  <li>Schweiz</li>
  <li>{t('datenschutz.verantwortlicher_für_die_datenverarbeitung_e-mail')} roman.messmer@media4u.ch</li>
  <li>{t('datenschutz.verantwortlicher_für_die_datenverarbeitung_mobile')} +41 787 658 842</li>
</ul>

<h2>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten')}</h2>
<p>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p1')}</p>

<ul>
  <li>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p2_1')}</li>
  <li>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p2_2')}</li>
  <li>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p2_3')}</li>
  <li>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p2_4')}</li>
  <li>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p2_5')}</li>
  <li>{t('datenschutz.erhebung_und_speicherung_personenbezogener_daten_p2_6')}</li>
</ul>

<h2>{t('datenschutz.verwendung_personenbezogener_daten')}</h2>
<p>{t('datenschutz.verwendung_personenbezogener_daten_p')}</p>

<h2>{t('datenschutz.cookies')}</h2>
<p>{t('datenschutz.cookies_p1')}</p>

<ul>
  <li>{t('datenschutz.cookies_p2_1')}</li>
  <li>{t('datenschutz.cookies_p2_2')}</li>
  <li>{t('datenschutz.cookies_p2_3')}</li>
</ul>

<h2>{t('datenschutz.google_analytics')}</h2>
<p>{t('datenschutz.google_analytics_p1')}</p>

<p>{t('datenschutz.google_analytics_p2')}</p>

<ul>
  <li>{t('datenschutz.google_analytics_p3_1')}</li>
  <li>{t('datenschutz.google_analytics_p3_2')}</li>
</ul>

<ul>
  <li>{t('datenschutz.google_analytics_p4_1')}</li>
  <li>{t('datenschutz.google_analytics_p4_2')}</li>
</ul>

<ul>
  <li>{t('datenschutz.google_analytics_p5_1')}</li>
  <li>{t('datenschutz.google_analytics_p5_2')}</li>
  <li><a target="blank" href="https://tools.google.com/dlpage/gaoptout">{t('datenschutz.google_analytics_p5_3')}</a></li>
</ul>

<ul>
  <li>{t('datenschutz.google_analytics_p6_1')}</li>
  <li><a target="blank" href="https://marketingplatform.google.com/about/analytics/terms/de/">{t('datenschutz.google_analytics_p6_2')}</a></li>
</ul>

<h2>{t('datenschutz.werbepartner_und_affiliate_links')}</h2>
<p>{t('datenschutz.werbepartner_und_affiliate_links_p1')}</p>

<p>{t('datenschutz.werbepartner_und_affiliate_links_p2')}</p>

<h2>{t('datenschutz.deine_rechte')}</h2>
<ul>
  <li>{t('datenschutz.deine_rechte_p1_1')}</li>
  <li>{t('datenschutz.deine_rechte_p1_2')}</li>
  <li>{t('datenschutz.deine_rechte_p1_3')}</li>
  <li>{t('datenschutz.deine_rechte_p1_4')}</li>
  <li>{t('datenschutz.deine_rechte_p1_5')}</li>
  <li>{t('datenschutz.deine_rechte_p1_6')}</li>
  <li>{t('datenschutz.deine_rechte_p1_7')}</li>
</ul>

<h2>{t('datenschutz.datensicherheit')}</h2>
<p>{t('datenschutz.datensicherheit_p')}</p>

<h2>{t('datenschutz.änderungen_dieser_datenschutzerklärung')}</h2>
<p>{t('datenschutz.änderungen_dieser_datenschutzerklärung_p')}</p>
    </div>
  );
};

export default Datenschutz;