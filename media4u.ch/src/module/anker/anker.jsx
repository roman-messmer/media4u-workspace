// src/components/ui/Anker.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import StraightIcon from './straight.svg';
import './anker.css'; 

const SCROLL_THRESHOLD = 120;
const IDLE_HIDE_MS = 2000;

// Extrahiert den primären Pfad für die Farbanpassung
function normalizeRoute(pathname, hash) {
  const raw = (hash && hash.startsWith('#/')) ? hash.slice(1) : pathname;
  const parts = raw.toLowerCase().split('/').filter(Boolean);

  if (parts[0] && /^[a-z]{2}(-[a-z]{2})?$/.test(parts[0])) {
    parts.shift();
  }

  return {
    first: parts[0] || '',
    full: `/${parts.join('/')}`,
  };
}

// Hauptkomponente: Rendert die Scroll-to-Top Anker
const Anker = () => {
  const location = useLocation();
  
  const [isVisible, setIsVisible] = useState(false);
  const scrollTimer = useRef(null);

  // Ermittelt den BEM-Modifier für die Theme-Farbe
  const themeModifier = useMemo(() => {
    const { first, full } = normalizeRoute(location.pathname, location.hash);

    if (first === 'media4u' || full.startsWith('/media4u')) return 'media4u';
    if (first === 'sms_textbild' || full.includes('/sms_textbild')) return 'sms';
    if (first === 'textbild2' || full.includes('/textbild2')) return 'textbild2';
    if (first === 'ascii_art_film' || full.includes('/ascii_art_film')) return 'ascii';

    return 'default';
  }, [location.pathname, location.hash]);

  // Steuert die Sichtbarkeit basierend auf Scroll-Aktivität
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < SCROLL_THRESHOLD) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);

      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        setIsVisible(false);
      }, IDLE_HIDE_MS);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer.current);
    };
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anchorBaseClass = `anker ${isVisible ? 'anker--visible' : ''}`;
  const iconClass = `anker__icon anker__icon--${themeModifier}`;

  return (
    <>
      <div className={`${anchorBaseClass} anker--right`}>
        <a
          href="#top"
          onClick={scrollToTop}
          className="anker__link"
          aria-label="Zurück zum Seitenanfang"
        >
          <img src={StraightIcon} alt="" className={iconClass} />
        </a>
      </div>

      <div className={`${anchorBaseClass} anker--left`}>
        <a
          href="#top"
          onClick={scrollToTop}
          className="anker__link"
          aria-label="Zurück zum Seitenanfang"
        >
          <img src={StraightIcon} alt="" className={iconClass} />
        </a>
      </div>
    </>
  );
};

export default Anker;