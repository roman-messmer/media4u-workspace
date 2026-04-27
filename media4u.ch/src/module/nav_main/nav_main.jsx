// src/components/layout/NavMain.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import AngleLeft from '../../icons/angle-left-solid-full.svg';
import AngleRight from '../../icons/angle-right-solid-full.svg';
import './nav_main.css';

const links = [
  { to: '/media4u', labelKey: 'nav_main.media4u', fallback: 'Media4U' },
  { to: '/sms_textbild', labelKey: 'nav_main.sms_textbild', fallback: 'SMS Textbild' },
  { to: '/textbild2', labelKey: 'nav_main.textbild2', fallback: 'Textbild 2.0' },
  { to: '/ascii_art_film', labelKey: 'nav_main.ascii_art_film', fallback: 'ASCII Art Film' },
];

const NavMain = () => {
  const { t } = useTranslation();
  const navRef = useRef(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // useCallback verhindert unnötiges Re-Rendern
  const checkScrollPosition = useCallback(() => {
    if (!navRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
    
    // Toleranz von 1-2px für verschiedene Display-DPIs (Retina etc.)
    setCanScrollLeft(Math.ceil(scrollLeft) > 1);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
  }, []);

  const scrollNav = (direction) => {
    if (!navRef.current) return;
    
    // Scrolle um 60% der sichtbaren Breite
    const scrollAmount = navRef.current.clientWidth * 0.6;
    const newScroll = direction === 'left' 
      ? navRef.current.scrollLeft - scrollAmount 
      : navRef.current.scrollLeft + scrollAmount;

    navRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Horizontales Scrollen per Mausrad übersetzen
    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      nav.scrollBy({ left: e.deltaY });
    };

    // Initiale Prüfung nach dem Rendern
    checkScrollPosition();

    // ResizeObserver ist moderner und zuverlässiger als 'window.resize',
    // da er auch reagiert, wenn nur das Element selbst seine Größe ändert (z.B. durch CSS-Layouts).
    const resizeObserver = new ResizeObserver(() => checkScrollPosition());
    resizeObserver.observe(nav);

    // Auf Scroll-Events lauschen (fängt Touch, Rad, Scrollbars und Tab-Fokus)
    nav.addEventListener('scroll', checkScrollPosition, { passive: true });
    nav.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup beim Unmounten
    return () => {
      nav.removeEventListener('scroll', checkScrollPosition);
      nav.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

  return (
    <div className="nav-main-wrapper">
      <button
        className="nav-main-wrapper__arrow nav-main-wrapper__arrow--left"
        onClick={() => scrollNav('left')}
        disabled={!canScrollLeft}
        aria-label={t('nav_main.scroll_left', 'Nach links scrollen')}
        tabIndex="-1" // Pfeile sollten beim Tabben übersprungen werden
      >
        <img src={AngleLeft} alt="" aria-hidden="true" className="nav-main-wrapper__icon" />
      </button>

      <nav
        className="nav-main-wrapper__track"
        ref={navRef}
        role="navigation"
        aria-label="Hauptnavigation"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              isActive ? 'nav-main-wrapper__link nav-main-wrapper__link--active' : 'nav-main-wrapper__link'
            }
          >
            {t(link.labelKey, link.fallback)}
          </NavLink>
        ))}
      </nav>

      <button
        className="nav-main-wrapper__arrow nav-main-wrapper__arrow--right"
        onClick={() => scrollNav('right')}
        disabled={!canScrollRight}
        aria-label={t('nav_main.scroll_right', 'Nach rechts scrollen')}
        tabIndex="-1" // Pfeile sollten beim Tabben übersprungen werden
      >
        <img src={AngleRight} alt="" aria-hidden="true" className="nav-main-wrapper__icon" />
      </button>
    </div>
  );
};

export default NavMain;