import React, { useState } from 'react';
import Generator from "./generator";

const AsciiArtGenerator = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <section className="ascii-intro">
      <header className="ascii-intro__header">
        <h1 className="ascii-intro__title">ASCII Art Generator</h1>
      </header>
      
      <div className="ascii-intro__content">
        <p className="ascii-intro__description">
          Willkommen beim ASCII Art Generator! Verwandeln Sie Ihre Bilder in einzigartige, aus Text bestehende Kunstwerke.
        </p>
        <a 
          href="#generator" 
          className="ascii-intro__link"
          onClick={(e) => { 
            e.preventDefault(); 
            setIsFullscreen(true); 
          }}
        >
          Zum Generator (Vollbild)
        </a>
      </div>

      {isFullscreen && <Generator onClose={() => setIsFullscreen(false)} />}
    </section>
  );
};

export default AsciiArtGenerator;