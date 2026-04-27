import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./background_colors.css";
import './nav_sub.css';

const NavSubMedia4u = () => {
  const { t } = useTranslation();

  const links = [
    { to: "/media4u/werbepartner", labelKey: "nav_sub.werbepartner" },
    { to: "/media4u/affiliate_marketing", labelKey: "nav_sub.affiliate_marketing" },
    { to: "/media4u/front_end_developer", labelKey: "nav_sub.front_end_developer" },
    { to: "/media4u/kontakt", labelKey: "nav_sub.kontakt" },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', margin: '0 auto' }}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            isActive ? "nav-sub-wrapper__link nav-sub-wrapper__link--active" : "nav-sub-wrapper__link"
          }
        >
          {t(link.labelKey, link.to)}
        </NavLink>
      ))}
    </div>
  );
};

export default NavSubMedia4u;