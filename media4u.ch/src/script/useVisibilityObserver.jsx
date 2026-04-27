import { useEffect } from 'react';

export function useVisibilityObserver({
  selector = '.zoom-in',
  visibleClass = 'visible',
  threshold = 0.1,
  rootMargin = '0px',
  dependencies = [] // <-- 1. NEU: Wir erlauben die Übergabe von Abhängigkeiten
} = {}) {
  useEffect(() => {
    let observer;

    // 2. NEU: Ein minimaler Timeout (50ms) gibt React die nötige Zeit, 
    // die Strapi-Daten als echtes HTML ins DOM zu zeichnen, bevor wir danach suchen.
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(selector);

      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver nicht verfügbar – Fallback aktiv.');
        elements.forEach(el => el.classList.add(visibleClass));
        return;
      }

      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add(visibleClass);
            } else {
              entry.target.classList.remove(visibleClass);
            }
          });
        },
        { threshold, rootMargin }
      );

      elements.forEach(el => observer.observe(el));
    }, 50);

    // Cleanup-Funktion
    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect(); // Trennt den Observer sauber, bevor er neu startet
      }
    };
  // 3. NEU: ...dependencies wird hier entpackt. Ändert sich ein Wert (z.B. loading), startet der Effekt neu!
  }, [selector, visibleClass, threshold, rootMargin, ...dependencies]); 
}