import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import "./background_colors.css";
import './nav_sub.css';

const NavSubAsciiArtFilm = () => {
  const { t } = useTranslation();

  const links = [
    { to: '/ascii_art_film/matrix', labelKey: 'nav_sub.matrix', fallbackLabel: 'Matrix' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', margin: '0 auto' }}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            isActive ? 'nav-sub-wrapper__link nav-sub-wrapper__link--active' : 'nav-sub-wrapper__link'
          }
        >
          {t(link.labelKey, link.fallbackLabel)}
        </NavLink>
      ))}
    </div>
  );
};

export default NavSubAsciiArtFilm;