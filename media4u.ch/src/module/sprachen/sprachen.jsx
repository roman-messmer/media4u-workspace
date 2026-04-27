// src/components/ui/Sprachen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./sprachen.css";
import translateIcon from "../../icons/translate_language.svg";

// Extrahiert den primären Sprachcode (z.B. "de" aus "de-CH")
function baseLang(code) {
  return (code || "").split("-")[0];
}

// Verfügbare Sprachen und Metadaten
const ALL_LINKS = Object.freeze([
  { code: "de", label: "Deutsch", title: "Deutsch" },
  { code: "en", label: "English", title: "Englisch" },
  { code: "fr", label: "Français", title: "Französisch" },
  { code: "it", label: "Italiano", title: "Italienisch" },
  { code: "es", label: "Español", title: "Spanisch" },
  { code: "pt", label: "Português", title: "Portugiesisch" },
  { code: "ru", label: "Русский", title: "Russisch" },
  { code: "ja", label: "日本語", title: "Japanisch" },
  { code: "ko", label: "한국어", title: "Koreanisch" },
  { code: "zh", label: "中文", title: "Chinesisch" },
  { code: "nl", label: "Nederlands", title: "Niederländisch" },
  { code: "vi", label: "Tiếng Việt", title: "Vietnamesisch" },
  { code: "th", label: "ไทย", title: "Thailändisch" },
  { code: "sv", label: "Svenska", title: "Schwedisch" },
  { code: "pl", label: "Polski", title: "Polnisch" },
  { code: "cs", label: "Čeština", title: "Tschechisch" },
  { code: "hu", label: "Magyar", title: "Ungarisch" },
  { code: "ro", label: "Română", title: "Rumänisch" },
  { code: "bg", label: "Български", title: "Bulgarisch" },
  { code: "fil", label: "Filipino", title: "Filipinisch" },
  { code: "id", label: "Bahasa Indonesia", title: "Indonesisch" },
  { code: "ms", label: "Bahasa Melayu", title: "Malaiisch" },
  { code: "hi", label: "हिन्दी", title: "Hindi" },
  { code: "tr", label: "Türkçe", title: "Türkisch" },
]);

const FALLBACK_PHRASES = ["MEDIA4U.CH", "Fullstack"];
const BRAND_PHRASE = "MEDIA4U.CH";

// Rotations-Zeichen für den Cursor-Effekt
const SYMBOLS_WRITE = ['|', '/', '-', '\\'];
const SYMBOLS_DELETE = ['|', '\\', '-', '/'];

// Custom Hook: Berechnet den Schreibmaschinen-Effekt und die Cursor-Rotation
function useTypewriter(phrases) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorSymbolIndex, setCursorSymbolIndex] = useState(0);

  // Steuert das zeitliche Tippen, Pausieren und Löschen der Phrasen
  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const currentFullPhrase = phrases[phraseIndex % phrases.length];
    let timer;

    const typingSpeed = 50;
    const deletingSpeed = 30;
    const pauseEnd = 2000;
    const pauseStart = 500;

    if (!isDeleting && charIndex < currentFullPhrase.length) {
      timer = setTimeout(() => setCharIndex((prev) => prev + 1), typingSpeed);
    } else if (!isDeleting && charIndex === currentFullPhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), pauseEnd);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => setCharIndex((prev) => prev - 1), deletingSpeed);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
      timer = setTimeout(() => {}, pauseStart);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases]);

  // Steuert die zyklische Rotation des Cursors
  useEffect(() => {
    const symbolInterval = 150; 
    const intervalId = setInterval(() => {
      setCursorSymbolIndex((prev) => (prev + 1) % SYMBOLS_WRITE.length);
    }, symbolInterval);

    return () => clearInterval(intervalId);
  }, []); 

  // Ermittelt den sichtbaren Text und das passende Cursor-Zeichen
  const currentFullPhrase = phrases[phraseIndex % phrases.length] || "";
  const visibleText = currentFullPhrase.substring(0, charIndex);
  
  const currentSymbols = isDeleting ? SYMBOLS_DELETE : SYMBOLS_WRITE;
  const cursorChar = currentSymbols[cursorSymbolIndex % currentSymbols.length];

  return { visibleText, currentFullPhrase, cursorChar };
}

// Hauptkomponente: Rendert Sprachauswahl und animierten Header
const Sprachen = () => {
  const { t, i18n } = useTranslation();
  const currentBase = baseLang(i18n.language);
  
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  // Lädt die Animations-Phrasen aus den Übersetzungen
  const phrases = useMemo(() => {
    const data = t("animation_phrases", { returnObjects: true });
    return Array.isArray(data) ? data : FALLBACK_PHRASES;
  }, [t, i18n.language]);

  // Filtert die verfügbaren Sprachen anhand der i18n-Konfiguration
  const links = useMemo(() => {
    const supported = (i18n?.options?.supportedLngs || [])
      .filter((l) => l !== "cimode")
      .map(baseLang);

    if (supported.length === 0) return ALL_LINKS;
    const uniq = new Set(supported);
    return ALL_LINKS.filter((l) => uniq.has(l.code));
  }, [i18n?.options?.supportedLngs]);

  // Ermittelt den Index der aktuell aktiven Sprache
  const activeIndex = useMemo(
    () => links.findIndex((l) => l.code === currentBase),
    [links, currentBase]
  );

  const { visibleText, currentFullPhrase, cursorChar } = useTypewriter(phrases);

  // Rendert den Text und wendet markenspezifisches Styling an
  const renderAnimatedText = () => {
    if (currentFullPhrase === BRAND_PHRASE) {
      const part1 = visibleText.substring(0, 5); 
      const part2 = visibleText.substring(5, 7); 
      const part3 = visibleText.substring(7);    

      return (
        <>
          {part1}
          {part2 && <span className="sprachen__highlight">{part2}</span>}
          {part3 && part3}
        </>
      );
    }
    return visibleText;
  };

  // Führt den Sprachwechsel durch und speichert die Auswahl
  const changeLanguage = useCallback(
    async (lang) => {
      const next = lang;
      if (baseLang(i18n.language) === next) {
        setIsOpen(false);
        return;
      }
      await i18n.changeLanguage(next);
      try {
        localStorage.setItem("i18nextLng", next);
      } catch { }
      setIsOpen(false);
    },
    [i18n]
  );

  // Schaltet die Sichtbarkeit des Menüs um
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Triggert die Button-Animation und öffnet/schließt das Menü
  const handleInteraction = useCallback(() => {
    const btn = buttonRef.current;
    
    if (btn && !btn.classList.contains("sprachen__toggle--animating")) {
      btn.classList.add("sprachen__toggle--animating");
      
      btn.addEventListener(
        "animationend",
        () => {
          btn.classList.remove("sprachen__toggle--animating");
        },
        { once: true }
      );
    }
    toggleMenu();
  }, [toggleMenu]);

  // Steuert die Tastaturnavigation innerhalb der Sprachauswahl
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
      if (!isOpen) return; 

      e.preventDefault();
      const last = links.length - 1;
      let next = focusedIndex >= 0 ? focusedIndex : activeIndex >= 0 ? activeIndex : 0;

      if (e.key === "ArrowRight") next = next >= last ? 0 : next + 1;
      if (e.key === "ArrowLeft") next = next <= 0 ? last : next - 1;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = last;

      setFocusedIndex(next);
      const buttons = listRef.current?.querySelectorAll("button.sprachen__link");
      buttons?.[next]?.focus();
    },
    [focusedIndex, activeIndex, links.length, isOpen]
  );

  // Setzt den Tastatur-Fokus bei Sprachwechsel zurück
  useEffect(() => {
    setFocusedIndex(-1);
  }, [currentBase]);

  return (
    <div className="sprachen">
      <nav
        className={`sprachen__nav ${isOpen ? "sprachen__nav--open" : ""}`}
        role="navigation"
        aria-label="Sprachauswahl"
        onKeyDown={onKeyDown}
        aria-hidden={!isOpen}
      >
        <ul className="sprachen__list" ref={listRef} role="list">
          {links.map((link) => {
            const isActive = currentBase === link.code;
            return (
              <li key={link.code} className="sprachen__item" role="listitem">
                <button
                  type="button"
                  className={`sprachen__link ${isActive ? "sprachen__link--active" : ""}`}
                  onClick={() => changeLanguage(link.code)}
                  title={link.title}
                  aria-label={`Sprache wechseln zu ${link.title}`}
                  aria-pressed={isActive ? "true" : "false"}
                  lang={link.code}
                  tabIndex={isOpen ? 0 : -1}
                >
                  {link.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sprachen__toolbar">
        <div className="sprachen__display" aria-hidden="true">
          {renderAnimatedText()}
          <span className="sprachen__cursor">{cursorChar}</span>
        </div>
      
        <button 
          ref={buttonRef}
          type="button"
          className="sprachen__toggle"
          onClick={handleInteraction}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Sprachauswahl schließen" : "Sprachauswahl öffnen"}
          aria-controls="language_list"
        >
          <img 
            src={translateIcon} 
            alt="" 
            className="sprachen__icon"
            aria-hidden="true" 
          />
        </button>
      </div>
    </div>
  );
};

export default Sprachen;