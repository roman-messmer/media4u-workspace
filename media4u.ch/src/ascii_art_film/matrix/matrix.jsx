import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/ascii_art_film.css";
import "../../css/ZoomIn.css";
import { useVisibilityObserver } from '../../script/useVisibilityObserver';

// Lazy Imports: Displays
const Display_Matrix1 = React.lazy(() => import("./display_matrix1.jsx"));
const Display_Matrix2 = React.lazy(() => import("./display_matrix2.jsx"));
const Display_Matrix3 = React.lazy(() => import("./display_matrix3.jsx"));
const Display_Matrix4 = React.lazy(() => import("./display_matrix4.jsx"));
const Display_Matrix5 = React.lazy(() => import("./display_matrix5.jsx"));
const Display_Matrix6 = React.lazy(() => import("./display_matrix6.jsx"));
const Display_Matrix_Reloaded1 = React.lazy(() => import("./display_matrix_reloaded1.jsx"));
const Display_Matrix_Reloaded2 = React.lazy(() => import("./display_matrix_reloaded2.jsx"));
const Display_Matrix_Reloaded3 = React.lazy(() => import("./display_matrix_reloaded3.jsx"));
const Display_Matrix_Reloaded4 = React.lazy(() => import("./display_matrix_reloaded4.jsx"));

// Lazy Imports: Vorschauen
const VorschauMatrix1 = React.lazy(() => import("./vorschau_matrix1.jsx"));
const VorschauMatrix2 = React.lazy(() => import("./vorschau_matrix2.jsx"));
const VorschauMatrix3 = React.lazy(() => import("./vorschau_matrix3.jsx"));
const VorschauMatrix4 = React.lazy(() => import("./vorschau_matrix4.jsx"));
const VorschauMatrix5 = React.lazy(() => import("./vorschau_matrix5.jsx"));
const VorschauMatrix6 = React.lazy(() => import("./vorschau_matrix6.jsx"));
const VorschauMatrixReloaded1 = React.lazy(() => import("./vorschau_matrix_reloaded1.jsx"));
const VorschauMatrixReloaded2 = React.lazy(() => import("./vorschau_matrix_reloaded2.jsx"));
const VorschauMatrixReloaded3 = React.lazy(() => import("./vorschau_matrix_reloaded3.jsx"));
const VorschauMatrixReloaded4 = React.lazy(() => import("./vorschau_matrix_reloaded4.jsx"));

export default function Matrix() {
  const { t } = useTranslation();
  const [currentDisplay, setCurrentDisplay] = useState('Display_Matrix1');
  const titleRef = useRef(null);

  useVisibilityObserver();

  // Konfiguration der Komponenten für einfacheres Rendering
  const matrixComponents = useMemo(() => ({
    Display_Matrix1: { main: <Display_Matrix1 />, preview: <VorschauMatrix1 /> },
    Display_Matrix2: { main: <Display_Matrix2 />, preview: <VorschauMatrix2 /> },
    Display_Matrix3: { main: <Display_Matrix3 />, preview: <VorschauMatrix3 /> },
    Display_Matrix4: { main: <Display_Matrix4 />, preview: <VorschauMatrix4 /> },
    Display_Matrix5: { main: <Display_Matrix5 />, preview: <VorschauMatrix5 /> },
    Display_Matrix6: { main: <Display_Matrix6 />, preview: <VorschauMatrix6 /> },
    Display_Matrix_Reloaded1: { main: <Display_Matrix_Reloaded1 />, preview: <VorschauMatrixReloaded1 /> },
    Display_Matrix_Reloaded2: { main: <Display_Matrix_Reloaded2 />, preview: <VorschauMatrixReloaded2 /> },
    Display_Matrix_Reloaded3: { main: <Display_Matrix_Reloaded3 />, preview: <VorschauMatrixReloaded3 /> },
    Display_Matrix_Reloaded4: { main: <Display_Matrix_Reloaded4 />, preview: <VorschauMatrixReloaded4 /> },
  }), []);

  // Effekt für das zuverlässige Scrollen nach State-Update
  useEffect(() => {
    // Falls wir bereits oben sind, müssen wir nicht zwingend scrollen
    // Aber für die Konsistenz triggern wir es hier
    if (titleRef.current) {
      const timeoutId = setTimeout(() => {
        titleRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // 100ms Puffer für Lazy-Loading/Suspense

      return () => clearTimeout(timeoutId);
    }
  }, [currentDisplay]);

  const handlePreviewClick = (displayName) => {
    setCurrentDisplay(displayName);
  };

  return (
    <div className="matrix-container">
      {/* Ankerpunkt für Scroll-Funktion */}
      <h1 ref={titleRef} style={{ scrollMarginTop: '20px' }}>
        {t('matrix.title')}
      </h1>

      {/* Hauptanzeige */}
      <div className="display_ascii_art_film zoom-in" aria-busy={!currentDisplay}>
        <Suspense fallback={<div className="loading-fallback">Lädt Anzeige...</div>}>
          {matrixComponents[currentDisplay]?.main || matrixComponents.Display_Matrix1.main}
        </Suspense>
      </div>

      {/* Bibliothektitel */}
      <div className="titel_bibliothek">
        <h2>{t('matrix.bibliothek')}</h2>
      </div>

      {/* Vorschau-Komponenten via Mapping */}
      <div className="matrix_vorschau">
        <Suspense fallback={<div className="loading-fallback">Lädt Vorschau...</div>}>
          {Object.keys(matrixComponents).map((key) => (
            <div 
              key={key} 
              onClick={() => handlePreviewClick(key)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePreviewClick(key)}
            >
              {matrixComponents[key].preview}
            </div>
          ))}
        </Suspense>
      </div>
    </div>
  );
}