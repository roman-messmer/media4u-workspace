// src/utils/sourceOverlay.js
function prettyHtml(html = '') {
  return html.replaceAll('><', '>\n<').trim()
}

/**
 * Liest ALLE `.frame` aus `.display` und schreibt den
 * formatierten HTML-Quelltext in `.quellcode pre.code > code`.
 * Außerdem wird `.quellcode` scrollbar gemacht.
 */
export function openSourceFromDisplay() {
  const display = document.querySelector('.display')
  const container = document.querySelector('.quellcode') // <-- Zielcontainer

  if (!display || !container) {
    console.warn('Fehlt: .display oder .quellcode')
    return
  }

  const frames = Array.from(display.querySelectorAll('.frame'))
  if (frames.length === 0) {
    console.warn('Keine .frame Elemente in .display gefunden')
    return
  }

  // nur die Frames ausgeben
  const html = frames.map(f => f.outerHTML).join('\n')

  // Ziel: <pre class="code"><code>…</code></pre>
  let preEl = container.querySelector('pre.code')
  let codeEl = container.querySelector('pre.code > code')

  // Falls das Markup noch nicht da ist, minimal herstellen (keine neue Datei)
  if (!preEl) {
    preEl = document.createElement('pre')
    preEl.className = 'code'
    codeEl = document.createElement('code')
    preEl.appendChild(codeEl)
    container.appendChild(preEl)
  } else if (!codeEl) {
    codeEl = document.createElement('code')
    preEl.appendChild(codeEl)
  }

  // Inhalt schreiben (ohne doppeltes Escaping: textContent reicht)
  codeEl.textContent = prettyHtml(html)

  // sichtbar machen, falls versteckt
  container.style.display = ''
}
