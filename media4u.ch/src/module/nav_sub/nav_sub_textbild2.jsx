import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./background_colors.css";
import './nav_sub.css';

const NavSubTextbild2 = () => {
  const { t } = useTranslation();

  const links = [
    { key: "neu2", label: "nav_sub.textbild2.neu2" },
    { key: "liebe_freundschaft2", label: "nav_sub.textbild2.liebe_freundschaft2" },
    { key: "festtage_party2", label: "nav_sub.textbild2.festtage_party2" },
    { key: "freizeit_arbeit2", label: "nav_sub.textbild2.freizeit_arbeit2" },
    { key: "sport_hobby2", label: "nav_sub.textbild2.sport_hobby2" },
    { key: "abenteuer_action2", label: "nav_sub.textbild2.abenteuer_action2" },
    { key: "erotik_sex2", label: "nav_sub.textbild2.erotik_sex2" },
  ];

  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.key}
          to={`/textbild2/${link.key}`}
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

export default NavSubTextbild2;