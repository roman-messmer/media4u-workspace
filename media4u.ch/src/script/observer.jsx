// src/utils/observer.jsx
export function observeVisibility({
  selector = '.zoom-in',
  visibleClass = 'visible',
  threshold = 0.1,
  rootMargin = '0px',
} = {}) {
  const elements = document.querySelectorAll(selector);

  if (!elements.length) {
    console.warn(`[observer] Keine Elemente für '${selector}' gefunden.`);
    return () => {};
  }

  if (!('IntersectionObserver' in window)) {
    console.warn('[observer] IntersectionObserver nicht verfügbar – Fallback wird verwendet.');
    elements.forEach(el => el.classList.add(visibleClass));
    return () => {};
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add(visibleClass);  // Sichtbar, wenn es im Bildschirm ist
        } else {
          el.classList.remove(visibleClass); // Ausblenden, wenn es den Bildschirm verlässt
        }
      });
    },
    { threshold, rootMargin }
  );

  elements.forEach(el => observer.observe(el));

  return () => {
    elements.forEach(el => observer.unobserve(el));
    observer.disconnect();
  };
}
