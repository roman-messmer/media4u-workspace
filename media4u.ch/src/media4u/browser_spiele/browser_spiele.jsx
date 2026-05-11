import React, { useState } from 'react';
import Spiel from "./spiel";

const BrowserSpiele = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <section className="spiel-intro">
      <header className="spiel-intro__header">
        <h1 className="spiel-intro__title">Browser Spiele</h1>
      </header>
      
      <div className="spiel-intro__content">
        <p className="spiel-intro__description">
          Willkommen bei den Browser Spielen! Tauche ein in spannende interaktive Welten.
        </p>
        
        {/* Semantische Optimierung: Ein Button für Aktionen (State-Änderung), kein Link */}
        <button 
          className="spiel-intro__btn"
          onClick={() => setIsFullscreen(true)}
        >
          Zum Spiel (Vollbild)
        </button>
      </div>

      {isFullscreen && <Spiel onClose={() => setIsFullscreen(false)} />}
    </section>
  );
};

export default BrowserSpiele;