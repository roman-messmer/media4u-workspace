// src/components/ui/Rechtliches.jsx
import React from "react"; // Expliziter React-Import für dein Projekt-Setup
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import "./rechtliches.css";

// Statische Konfiguration der Rechts-Links
const LINKS = Object.freeze([
  { to: "/media4u/impressum", key: "legal.impressum", fallback: "Impressum" },
  { to: "/media4u/datenschutz", key: "legal.datenschutz", fallback: "Datenschutz" },
  { to: "/media4u/agb",        key: "legal.agb",        fallback: "AGB" },
]);

// Hauptkomponente: Rendert die rechtliche Sub-Navigation
const Rechtliches = () => {
  const { t } = useTranslation();

  return (
    <nav className="rechtliches" aria-label={t("legal.sectionLabel", { defaultValue: "Rechtliches" })}>
      <ul className="rechtliches__list" role="list">
        {LINKS.map(({ to, key, fallback }) => (
          <li key={to} className="rechtliches__item" role="listitem">
            <NavLink
              to={to}
              // BEM-Klassen für den Link und seinen aktiven Zustand
              className={({ isActive }) =>
                `rechtliches__link ${isActive ? "rechtliches__link--active" : ""}`.trim()
              }
              //data-active Attribut wurde entfernt, da die Funktion hier fehlerhaft war
              end
            >
              {t(key, { defaultValue: fallback })}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Rechtliches;