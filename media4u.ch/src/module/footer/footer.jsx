// src/components/layout/Footer.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "./footer.css";

// Hauptkomponente: Rendert den statischen Footer inklusive Copyright und Übersetzungen
const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      &copy; {year} MEDIA<span className="footer__4u">4U</span>.CH | {t("footer.alle_rechte_vorbehalten", "Alle Rechte vorbehalten.")}
    </footer>
  );
};

export default Footer;