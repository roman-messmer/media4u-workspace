// src/components/ui/Slogan.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "./slogan.css";

// Hauptkomponente: Rendert den statischen Slogan aus den i18n JSON-Dateien
const Slogan = () => {
  const { t } = useTranslation();

  return (
    <div className="slogan">
      <div className="slogan__content" role="region" aria-label="Slogan">
        <div className="slogan__line slogan__line--primary">
          {t("header.slogan1")}
        </div>
        <div className="slogan__line slogan__line--secondary">
          {t("header.slogan2")}
        </div>
      </div>
    </div>
  );
};

export default Slogan;