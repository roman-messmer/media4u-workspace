// src/components/pages/Kontakt.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./kontakt.css";

import DynamicSEO from "../../module/DynamicSEO";
import { sanitizeHtml } from "../../module/utils/sanitizeHtml.js";
import { useVisibilityObserver } from "../../script/useVisibilityObserver";
import AsciiArtPortrait from "./ascii-art_portrait";
import KontaktQR from "./kontakt_qr";

/**
 * Hilfskomponente für E-Mail Branding.
 * Wandelt "media4u.ch" in das Logo-Format mit roter "4" um.
 */
const BrandEmail = ({ email }) => {
  const [local, domain = ""] = (email || "").split("@");
  const isMedia4u = domain.toLowerCase().includes("media4u.ch");

  return (
    <>
      {local}@
      {isMedia4u ? (
        <>media<span className="kontakt__brand-accent">4u</span>.ch</>
      ) : (
        domain
      )}
    </>
  );
};

/**
 * Bereinigt Telefonnummern für den tel:-Link (E.164-Format).
 */
const toTelHref = (phone) => {
  if (!phone) return "";
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
};

const Kontakt = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n?.language?.split("-")[0] || "de";

  // Aktiviert Einblend-Animationen beim Scrollen
  useVisibilityObserver();

  /**
   * Bereitet die Adresse aus dem JSON sicher auf.
   * Ersetzt Zeilenumbrüche (\n) durch echte HTML-Breaks (<br/>).
   */
  const sanitizedAddress = useMemo(() => {
    const rawAddress = t("kontakt.address");
    return { __html: sanitizeHtml(rawAddress.replace(/\n/g, "<br/>")) };
  }, [t]);

  return (
    <main className="kontakt">
      <DynamicSEO page="kontakt" lang={lang} />

      <header className="kontakt__header">
        <h1 className="kontakt__title">{t("kontakt.title")}</h1>
      </header>

      {/* Portrait Komponente (ASCII-Kunst) */}
      <AsciiArtPortrait />

      {/* Kontakt Details mit Schema.org für SEO */}
      <article 
        className="kontakt__card" 
        itemScope 
        itemType="https://schema.org/Person"
      >
        <h2 className="kontakt__name" itemProp="name">
          {t("kontakt.name")}
        </h2>

        {/* Adresse */}
        <div className="kontakt__group">
          <address 
            className="kontakt__address" 
            itemProp="address" 
            dangerouslySetInnerHTML={sanitizedAddress} 
          />
        </div>

        {/* E-Mail */}
        <div className="kontakt__group">
          <h2 className="kontakt__label">{t("kontakt.email_label")}</h2>
          <a 
            className="kontakt__link" 
            href={`mailto:${t("kontakt.email_value")}`} 
            itemProp="email"
          >
            <BrandEmail email={t("kontakt.email_value")} />
          </a>
        </div>

        {/* Mobile / Telefon */}
        <div className="kontakt__group">
          <h2 className="kontakt__label">{t("kontakt.mobile_label")}</h2>
          <a 
            className="kontakt__link" 
            href={toTelHref(t("kontakt.mobile_value"))} 
            itemProp="telephone"
          >
            {/* QR-Code */}
            {t("kontakt.mobile_value")}
          </a>
        </div>

        <KontaktQR />

      </article>
    </main>
  );
};

export default Kontakt;