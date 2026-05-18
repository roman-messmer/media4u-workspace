import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./kontakt.css";

import DynamicSEO from "../../module/DynamicSEO";
import { sanitizeHtml } from "../../module/utils/sanitizeHtml.js";
import { useVisibilityObserver } from "../../script/useVisibilityObserver";
import AsciiArtPortrait from "./ascii-art_portrait";
import KontaktQR from "./kontakt_qr"; 

const Kontakt = () => {
  // Namespace explizit auf 'kontakt' setzen, analog zu 'affiliate'
  const { t, i18n } = useTranslation('kontakt'); 
  const lang = i18n?.language?.split("-")[0] || "de";

  useVisibilityObserver();

  // Header-HTML auslesen, zusammensetzen und gegen XSS absichern
  const headerHtml = useMemo(() => {
    const contentArray = t("kontakt_header_content", { returnObjects: true });
    const rawHtml = Array.isArray(contentArray) ? contentArray.join("") : (contentArray || "");
    return sanitizeHtml(rawHtml);
  }, [t]);

  // Section-HTML auslesen, zusammensetzen und gegen XSS absichern
  const sectionHtml = useMemo(() => {
    const contentArray = t("kontakt_section_content", { returnObjects: true });
    const rawHtml = Array.isArray(contentArray) ? contentArray.join("") : (contentArray || "");
    return sanitizeHtml(rawHtml);
  }, [t]);

  return (
    <>
      <DynamicSEO page="kontakt" lang={lang} />

      {/* Inizierung des bereinigten Header-HTML */}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: headerHtml }} />

      <AsciiArtPortrait />

      <section 
        className="kontakt__card" 
        itemScope 
        itemType="https://schema.org/Person"
      >
        {/* Inizierung der bereinigten Adressdaten */}
        <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: sectionHtml }} />
        
        <KontaktQR />
      </section>
    </>
  );
};

export default Kontakt;