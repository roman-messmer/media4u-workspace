// src/components/auswahl/SpiegelnDrehen.jsx
import React, { useCallback } from 'react'
import {
  useFrameNav,
  isRotateClass,
  makeRotateClass,
} from '../../context/FrameNavContext'

/**
 * Drehen und Spiegeln per Klassen im 5° Raster, persistiert in item.classes:
 * - Keine: drehen_0
 * - Spiegeln: spiegeln_drehen_<grad>
 * - Links: -5 Grad
 * - Rechts: +5 Grad
 *
 * Bevorzugt Context API (setRotateForActiveItems), sonst DOM Fallback.
 * Es werden keine Inline Styles gesetzt.
 */
export default function SpiegelnDrehen() {
  // optionaler Context
  const nav = (() => { try { return useFrameNav?.() ?? {} } catch { return {} } })()

  // Aktuellen Zustand aus erstem aktiven PRE lesen
  const readCurrent = () => {
    const frame =
      document.querySelector('figure.textbild2 .display .frame.show') ||
      document.querySelector('figure.textbild2 .display')
    if (!frame) return { deg: 0, flip: false }

    const first = frame.querySelector('pre.active')
    if (!first) return { deg: 0, flip: false }

    let deg = 0
    let flip = false
    first.classList.forEach(cls => {
      if (isRotateClass(cls)) {
        const m = cls.match(/^(spiegeln_drehen|drehen)_(\d+)$/)
        if (m) {
          deg = parseInt(m[2], 10) || 0
          flip = m[1] === 'spiegeln_drehen'
        }
      }
    })
    return { deg, flip }
  }

  // DOM Fallback: Klassen direkt auf aktive PREs schreiben
  const applyDomFallback = useCallback((deg, flip) => {
    const frame =
      document.querySelector('figure.textbild2 .display .frame.show') ||
      document.querySelector('figure.textbild2 .display')
    if (!frame) return
    const cls = makeRotateClass(deg, flip)
    frame.querySelectorAll('pre.active').forEach(el => {
      Array.from(el.classList).forEach(c => { if (isRotateClass(c)) el.classList.remove(c) })
      el.classList.add(cls)
      // optionale Metadaten, kein Style
      el.dataset.rotate = String(((deg % 360) + 360) % 360)
      el.dataset.flip = String(!!flip)
    })
  }, [])

  const apply = useCallback((mode) => {
    const { deg, flip } = readCurrent()
    let nextDeg = deg
    let nextFlip = flip

    if (mode === 'none') { nextDeg = 0; nextFlip = false }
    if (mode === 'flip') { nextFlip = !flip }
    if (mode === 'left') { nextDeg = (deg - 5 + 360) % 360 }
    if (mode === 'right') { nextDeg = (deg + 5) % 360 }

    if (typeof nav.setRotateForActiveItems === 'function') {
      nav.setRotateForActiveItems({ deg: nextDeg, flip: nextFlip })
    } else {
      applyDomFallback(nextDeg, nextFlip)
    }
  }, [nav, applyDomFallback])

  return (
    <div className="spiegeln_drehen" role="group" aria-label="Drehen und Spiegeln">
      <button
        type="button"
        className="nav_nicht_drehen_spiegeln"
        onClick={() => apply('none')}
        aria-label="Keine Drehung oder Spiegelung"
        title="Keine Drehung oder Spiegelung"
      >
        Keine Drehung oder Spiegelung
      </button>

      <button
        type="button"
        className="nav_drehen_spiegeln"
        onClick={() => apply('flip')}
        aria-label="Horizontal spiegeln"
        title="Horizontal spiegeln"
      >
        Horizontal spiegeln
      </button>

      <button
        type="button"
        className="nav_drehen_spiegeln_links"
        onClick={() => apply('left')}
        aria-label="5 Grad nach links drehen"
        title="5 Grad nach links drehen"
      >
        5 Grad links
      </button>

      <button
        type="button"
        className="nav_drehen_spiegeln_rechts"
        onClick={() => apply('right')}
        aria-label="5 Grad nach rechts drehen"
        title="5 Grad nach rechts drehen"
      >
        5 Grad rechts
      </button>
    </div>
  )
}
