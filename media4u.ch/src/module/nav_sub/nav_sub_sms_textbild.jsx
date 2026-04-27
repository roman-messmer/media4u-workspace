import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./background_colors.css";
import './nav_sub.css';

const NavSubSmsTextbild = () => {
  const { t } = useTranslation();

  const links = [
    { key: "neu", label: "nav_sub.sms_textbild.neu" },
    { key: "liebe_freundschaft", label: "nav_sub.sms_textbild.liebe_freundschaft" },
    { key: "festtage_party", label: "nav_sub.sms_textbild.festtage_party" },
    { key: "freizeit_arbeit", label: "nav_sub.sms_textbild.freizeit_arbeit" },
    { key: "sport_hobby", label: "nav_sub.sms_textbild.sport_hobby" },
    { key: "abenteuer_action", label: "nav_sub.sms_textbild.abenteuer_action" },
    { key: "erotik_sex", label: "nav_sub.sms_textbild.erotik_sex" },
  ];

  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.key}
          to={`/sms_textbild/${link.key}`}
          className={({ isActive }) =>
            isActive ? "nav-sub-wrapper__link nav-sub-wrapper__link--active" : "nav-sub-wrapper__link"
          }
        >
          {t(link.label, link.key)}
        </NavLink>
      ))}
    </>
  );
};

export default NavSubSmsTextbild;