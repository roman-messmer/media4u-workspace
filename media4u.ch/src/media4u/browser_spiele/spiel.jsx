import React from 'react';
import "./spiel.css"; 

const Spiel = ({ onClose }) => {
  return (
    <dialog className="spiel-overlay" open aria-modal="true">
      
      <article className="spiel-overlay__content">
        {/* Schließen-Icon */}
        <button 
          className="spiel-overlay__close-btn" 
          onClick={onClose}
          aria-label="Vollbild schliessen"
        >
          <svg className="spiel-overlay__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <header className="spiel-overlay__header">
          <h3 className="spiel-overlay__title">Browser Spiele</h3>
        </header>
        <div className="spiel-overlay__body">
          <p className="spiel-overlay__text">Hier entsteht der Spielbereich. Viel Spass!</p>
          {/* Hier kommt später die Spiellogik / das Canvas hin */}
        </div>
      </article>

    </dialog>
  );
};

export default Spiel;