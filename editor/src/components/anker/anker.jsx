import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import StraightIcon from '../anker/straight.svg';
import '../anker/anker.css';

const SCROLL_THRESHOLD = 120;
const IDLE_HIDE_MS = 2000;

// Hash-/Path-Routing normalisieren, optionales Locale-Präfix strippen
function normalizeRoute(pathname, hash) {
  const raw = (hash && hash.startsWith('#/')) ? hash.slice(1) : pathname;
  const parts = raw.toLowerCase().split('/').filter(Boolean); // ['de','vorlagen']

  if (parts[0] && /^[a-z]{2}(-[a-z]{2})?$/.test(parts[0])) {
    parts.shift(); // locale abwerfen
  }
  return {
    first: parts[0] || '',
    full: `/${parts.join('/')}`,
  };
}

export default function Anker() {
  const location = useLocation();
  const ankerRef = useRef(null);
  const scrollTimer = useRef(null);

  const routeInfo = useMemo(
    () => normalizeRoute(location.pathname, location.hash),
    [location.pathname, location.hash]
  );

  // Nur auf /vorlagen anzeigen (optional mit Locale-Präfix)
  const showOnVorlagen = routeInfo.first === 'vorlagen' || routeInfo.full.startsWith('/vorlagen');

  // Route -> Farbkategorie (falls du die Farben auch für Vorlagen brauchst)
  const pageClass = useMemo(() => {
    if (!showOnVorlagen) return 'icon--hidden'; // keine Styles nötig, wird eh nicht gerendert
    if (routeInfo.first === 'media4u' || routeInfo.full.startsWith('/media4u')) return 'icon--media4u';
    if (routeInfo.first === 'sms_textbild' || routeInfo.full.includes('/sms_textbild')) return 'icon--sms';
    if (routeInfo.first === 'textbild2' || routeInfo.full.includes('/textbild2')) return 'icon--textbild2';
    if (routeInfo.first === 'ascii_art_film' || routeInfo.full.includes('/ascii_art_film')) return 'icon--ascii';
    return 'icon--default';
  }, [routeInfo.first, routeInfo.full, showOnVorlagen]);

  // Scroll-Visibility nur aktivieren, wenn wir auf /vorlagen sind
  useEffect(() => {
    if (!showOnVorlagen) return; // keine Listener außerhalb von /vorlagen

    const el = ankerRef.current;
    if (!el) return;

    const show = () => el.classList.add('visible');
    const hide = () => el.classList.remove('visible');

    const handleScroll = () => {
      if (window.scrollY < SCROLL_THRESHOLD) {
        hide();
        return;
      }
      show();
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(hide, IDLE_HIDE_MS);
    };

    // initial prüfen
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer.current);
    };
  }, [showOnVorlagen]);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Außerhalb von /vorlagen nichts rendern
  if (!showOnVorlagen) return null;

  return (
    <div className="anker" ref={ankerRef}>
      <a
        href="#top"
        onClick={scrollToTop}
        className="icon-wrapper"
        aria-label="Zurück zum Seitenanfang"
        title="Zurück zum Seitenanfang"
      >
        <img src={StraightIcon} alt="Nach oben" className={`icon ${pageClass}`} />
      </a>
    </div>
  );
}
