import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzung
import "../../css/media4u.css";
import "../../css/ZoomIn.css";
import DynamicSEO from '../../module/DynamicSEO'; // Import der DynamicSEO-Komponente

import { useVisibilityObserver } from '../../script/useVisibilityObserver';

const Impressum = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  useVisibilityObserver();

  return (
    <div>
      {/* SEO-Komponente für die Seite */}
      <DynamicSEO page="media4u" lang={lang} />

      <h1>{t('impressum.title')}</h1>
<ul>
  <li>Roman Messmer</li>
  <li>Haldenweg 1</li>
  <li>8180 Bülach</li>
  <li>Schweiz</li>
</ul>

<h2>{t('impressum.kontakt')}</h2>
<ul>
  <li>E-Mail: roman.messmer@media4u.ch</li>
  <li>Telefon: +41 78 765 88 42</li>
</ul>

<h2>{t('impressum.vertretungsberechtigter')}</h2>
<p>Roman Messmer</p>

<h2>{t('impressum.handelsregistereintrag')}</h2>
<ul>
  <li>{t('impressum.handelsregistereintrag_p1_1')}</li>
  <li>{t('impressum.handelsregistereintrag_p1_2')}</li>
</ul>

<ul>
  <li>{t('impressum.handelsregistereintrag_p2_1')}</li>
  <li>{t('impressum.handelsregistereintrag_p2_2')}</li>
</ul>

<h2>{t('impressum.zweck_der_webseite')}</h2>

<ul>
  <li>{t('impressum.zweck_der_webseite_p1_1')}</li>
  <li>{t('impressum.zweck_der_webseite_p1_2')}</li>
  <li>{t('impressum.zweck_der_webseite_p1_3')}</li>
</ul>

<h2>{t('impressum.haftungsausschluss')}</h2>
<h2>{t('impressum.haftung_für_inhalte')}</h2>
<p>{t('impressum.haftung_für_inhalte_p')}</p>

<h2>{t('impressum.haftung_für_links')}</h2>
<p>{t('impressum.haftung_für_links_p')}</p>

<h2>{t('impressum.datenschutz')}</h2>
<p>{t('impressum.datenschutz_p')}</p>
    </div>
  );
};

export default Impressum;