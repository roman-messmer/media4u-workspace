import React from 'react';
import { useTranslation } from 'react-i18next'; // Hook für die Übersetzung
import "../../css/media4u.css";
import "../../css/ZoomIn.css";
import DynamicSEO from '../../module/DynamicSEO'; // Import der DynamicSEO-Komponente

import { useVisibilityObserver } from '../../script/useVisibilityObserver';

const Agb = () => {
  const { t, i18n } = useTranslation(); // Übersetzungsfunktion und i18n-Instanz
  const lang = i18n.language; // Aktuelle Sprache aus i18next

  useVisibilityObserver();

  return (
    <div>
      {/* SEO-Komponente für die Seite */}
      <DynamicSEO page="media4u" lang={lang} />

<h1>{t('agb.title')}</h1>

<p>{t('agb.title_p1')}</p>

<p>{t('agb.title_p2')}</p>

<h2>{t('agb.geltungsbereich')}</h2>
<p>{t('agb.geltungsbereich_p')}</p>

<h2>{t('agb.leistungen')}</h2>
<ul>
  <li>{t('agb.leistungen_p1_1')}</li>
  <li>{t('agb.leistungen_p1_2')}</li>
  <li>{t('agb.leistungen_p1_3')}</li>
  <li>{t('agb.leistungen_p1_4')}</li>
  <li>{t('agb.leistungen_p1_5')}</li>
</ul>

<h2>{t('agb.vertragsabschluss')}</h2>
<ul>
  <li>{t('agb.vertragsabschluss_p1_1')}</li>
  <li>{t('agb.vertragsabschluss_p1_2')}</li>
  <li>{t('agb.vertragsabschluss_p1_3')}</li>
  <li>{t('agb.vertragsabschluss_p1_4')}</li>
</ul>

<h2>{t('agb.preise_und_zahlungsbedingungen')}</h2>
<ul>
  <li>{t('agb.preise_und_zahlungsbedingungen_p1_1')}</li>
  <li>{t('agb.preise_und_zahlungsbedingungen_p1_2')}</li>
  <li>{t('agb.preise_und_zahlungsbedingungen_p1_3')}</li>
  <li>{t('agb.preise_und_zahlungsbedingungen_p1_4')}</li>
</ul>

<p>{t('agb.preise_und_zahlungsbedingungen_p2')}</p>

<h2>{t('agb.rechte_und_pflichten_der_nutzer')}</h2>
<ul>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_1')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_2')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_3')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_4')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_5')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_6')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_7')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_8')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_9')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_10')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_11')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_12')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_13')}</li>
  <li>{t('agb.rechte_und_pflichten_der_nutzer_p1_14')}</li>
</ul>

<p>{t('agb.rechte_und_pflichten_der_nutzer_p2')}</p>

<h2>{t('agb.verfügbarkeit_der_webseite')}</h2>
<p>{t('agb.verfügbarkeit_der_webseite_p')}</p>

<h2>{t('agb.urheberrecht')}</h2>
<p>{t('agb.urheberrecht_p')}</p>

<h2>{t('agb.änderungen_der_agb')}</h2>
<p>{t('agb.änderungen_der_agb_p')}</p>

<h2>{t('agb.gerichtsstand_und_anwendbares_recht')}</h2>
<p>{t('agb.gerichtsstand_und_anwendbares_recht_p')}</p>
    </div>
  );
};

export default Agb;