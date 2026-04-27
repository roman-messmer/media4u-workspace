// src/components/ui/Logo.jsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import './logo.css';

const ANIMATION_CHARS = ['|', '/', '-', '\\'];

const LOGO_PARTS = [
  { text: 'MEDIA', isRed: false },
  { text: '4U', isRed: true },
  { text: '.CH', isRed: false }
];

// Memoisiertes Zeichen für den ASCII-Rotations-Effekt
const AsciiChar = memo(forwardRef(({ char, isRed, index }, ref) => {
  const [displayChar, setDisplayChar] = useState(char);
  const [isActive, setIsActive] = useState(false);
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const stopAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDisplayChar(char);
    setIsActive(false);
  };

  const triggerAnimation = () => {
    stopAnimation();
    setIsActive(true);

    let frameIndex = 0;
    
    intervalRef.current = setInterval(() => {
      setDisplayChar(ANIMATION_CHARS[frameIndex]);
      frameIndex = (frameIndex + 1) % ANIMATION_CHARS.length;
    }, 60);

    timeoutRef.current = setTimeout(() => {
      stopAnimation();
    }, 1000);
  };

  useImperativeHandle(ref, () => ({
    trigger: triggerAnimation
  }));

  useEffect(() => {
    return () => stopAnimation();
  }, [char]);

  // BEM-Klassen basierend auf Zustand und Konfiguration
  const baseClass = "logo__char";
  const activeClass = isActive && !isRed ? "logo__char--animating" : "";
  const redClass = isRed ? "logo__char--red" : "";

  return (
    <span
      className={`${baseClass} ${activeClass} ${redClass}`.trim()}
      onMouseEnter={triggerAnimation}
      data-index={index}
    >
      {displayChar}
    </span>
  );
}));

AsciiChar.displayName = 'AsciiChar';

// Hauptkomponente: Interaktives Markenlogo
const Logo = () => {
  const charRefs = useRef([]); 
  const totalChars = LOGO_PARTS.reduce((acc, part) => acc + part.text.length, 0);

  // Zufälliger Glitch-Effekt
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const idx = Math.floor(Math.random() * totalChars);
        charRefs.current[idx]?.trigger();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [totalChars]);

  // Touch-Support für mobile Geräte
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.hasAttribute('data-index')) {
      const idx = parseInt(element.getAttribute('data-index'), 10);
      charRefs.current[idx]?.trigger();
    }
  };

  let globalIndex = 0;

  return (
    <a 
      href="/" 
      className="logo" 
      aria-label="MEDIA4U.CH"
      onTouchMove={handleTouchMove}
    >
      <span aria-hidden="true" className="logo__visual">
        {LOGO_PARTS.map((part, partIdx) => (
          <span key={partIdx} className="logo__part">
            {part.text.split('').map((char) => {
              const idx = globalIndex++;
              return (
                <AsciiChar
                  key={idx}
                  ref={el => charRefs.current[idx] = el}
                  char={char}
                  index={idx}
                  isRed={part.isRed}
                />
              );
            })}
          </span>
        ))}
      </span>
    </a>
  );
};

export default Logo;