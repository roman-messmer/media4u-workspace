import React from 'react';
import "./generator.css"; 

const Generator = ({ onClose }) => {
  return (
    <dialog className="fullscreen-overlay" open aria-modal="true">
      
      <article className="fullscreen-overlay__content">
        {/* Schließen-Icon jetzt INNERHALB der weißen Box */}
        <button 
          className="fullscreen-overlay__close-btn" 
          onClick={onClose}
          aria-label="Vollbild schliessen"
        >
          <svg className="fullscreen-overlay__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <header className="fullscreen-overlay__header">
          <h3 className="fullscreen-overlay__title">ASCII Art Generator</h3>
        </header>
        <div className="fullscreen-overlay__body">
          <p className="fullscreen-overlay__text">Hier entsteht der Arbeitsbereich für die Bildumwandlung.</p>
          {/* Hier kommen später Canvas, File-Upload etc. hin */}
        </div>
      </article>

    </dialog>
  );
};

export default Generator;