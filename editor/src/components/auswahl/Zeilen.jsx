// src/components/zeilen/Zeilen.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useFrameNav } from '../../context/FrameNavContext'

/**
 * Setzt Klassen ausschliesslich auf aktive PREs:
 * - zeilen1 |zeilen2 | zeilen4 | zeilen8 | zeilen16 (exklusiv)
 * - bold (optional)
 *
 * Persistenz:
 * - Bevorzugt Context-API updateClassesForActiveItems, damit item.classes aktualisiert wird.
 * - Kein Fallback auf erstes PRE. Wenn kein aktives PRE vorhanden ist, passiert nichts.
 * - UI-State wird nicht zurückgesetzt, wenn keine aktiven PREs existieren.
 */
export default function Zeilen() {
  // optionaler Context
  const nav = (() => {
    try { return useFrameNav?.() ?? {} } catch { return {} }
  })()
  const { current } = nav

  const SIZE_CLASSES = useMemo(() => ['zeilen1','zeilen2', 'zeilen4', 'zeilen8', 'zeilen16'], [])

  const getRoot = useCallback(() => {
    return document.querySelector('figure.textbild2 .display')
  }, [])

  const getFrameEl = useCallback(() => {
    const root = getRoot()
    if (!root) return null
    const frames = Array.from(root.querySelectorAll('.frame'))
    const byIndex = frames?.[Math.max(0, Math.min(current ?? 0, frames.length - 1))] || null
    const byShow = root.querySelector('.frame.show')
    return byIndex || byShow || null
  }, [current, getRoot])

  const readActiveEls = useCallback(() => {
    const frame = getFrameEl()
    if (!frame) return []
    return Array.from(frame.querySelectorAll('pre.active'))
  }, [getFrameEl])

  const readStateFromDom = useCallback((prevState) => {
    const activeEls = readActiveEls()
    const first = activeEls[0]
    if (!first) return prevState
    const cls = first.className.split(/\s+/)
    const size = SIZE_CLASSES.find(c => cls.includes(c)) || prevState.size || 'zeilen4'
    const bold = cls.includes('bold')
    return { size, bold }
  }, [SIZE_CLASSES, readActiveEls])

  const [{ size, bold }, setUi] = useState(() => ({ size: 'zeilen4', bold: false }))
  const [hasActive, setHasActive] = useState(false)

  // Initial und bei Framewechsel den UI-State aus dem aktiven Element lesen
  useEffect(() => {
    setUi(s => readStateFromDom(s))
    setHasActive(readActiveEls().length > 0)
  }, [current, readStateFromDom, readActiveEls])

  // Beobachte Änderungen an .active innerhalb des aktuellen Frames, um Buttons korrekt zu sperren
  useEffect(() => {
    const frame = getFrameEl()
    if (!frame) return
    const mo = new MutationObserver(() => {
      setHasActive(readActiveEls().length > 0)
      setUi(s => readStateFromDom(s))
    })
    try {
      mo.observe(frame, { attributes: true, childList: true, subtree: true, characterData: false })
    } catch {}
    return () => { try { mo.disconnect() } catch {} }
  }, [getFrameEl, readActiveEls, readStateFromDom])

  // DOM-Fallback: nur auf aktive PREs anwenden, nie auf andere
  const applySizeDomActive = useCallback((targetSize) => {
    const els = readActiveEls()
    if (!els.length) return false
    els.forEach(el => {
      el.classList.remove('zeilen1','zeilen2', 'zeilen4', 'zeilen8', 'zeilen16')
      el.classList.add(targetSize)
    })
    return true
  }, [readActiveEls])

  const applyBoldDomActive = useCallback((nextBold) => {
    const els = readActiveEls()
    if (!els.length) return false
    els.forEach(el => {
      if (nextBold) el.classList.add('bold')
      else el.classList.remove('bold')
    })
    return true
  }, [readActiveEls])

  const setSize = useCallback((targetSize) => {
    if (!hasActive) return
    if (typeof nav.updateClassesForActiveItems === 'function') {
      nav.updateClassesForActiveItems((classes) => {
        const without = classes.filter(c => !SIZE_CLASSES.includes(c))
        return Array.from(new Set([...without, targetSize]))
      })
    } else {
      const ok = applySizeDomActive(targetSize)
      if (!ok) return
    }
    setUi(s => ({ ...s, size: targetSize }))
  }, [SIZE_CLASSES, nav, applySizeDomActive, hasActive])

  const toggleBold = useCallback(() => {
    if (!hasActive) return
    const next = !bold
    if (typeof nav.updateClassesForActiveItems === 'function') {
      nav.updateClassesForActiveItems((classes) => {
        const has = classes.includes('bold')
        return has ? classes.filter(c => c !== 'bold') : [...classes, 'bold']
      })
    } else {
      const ok = applyBoldDomActive(next)
      if (!ok) return
    }
    setUi(s => ({ ...s, bold: next }))
  }, [bold, nav, applyBoldDomActive, hasActive])

  return (
    <div className="zeilen_panel" role="group" aria-label="Zeilenhöhe und Fettdruck">
      <button
        type="button"
        className={`link zeichen_groesse_1${size === 'zeilen1' ? ' active' : ''}`}
        onClick={() => setSize('zeilen1')}
        aria-pressed={size === 'zeilen1'}
        aria-label="Zeilen 1"
        title="Zeilen 1"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Zeilen 1
      </button>

      <button
        type="button"
        className={`link zeichen_groesse_2${size === 'zeilen2' ? ' active' : ''}`}
        onClick={() => setSize('zeilen2')}
        aria-pressed={size === 'zeilen2'}
        aria-label="Zeilen 2"
        title="Zeilen 2"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Zeilen 2
      </button>

      <button
        type="button"
        className={`link zeichen_groesse_4${size === 'zeilen4' ? ' active' : ''}`}
        onClick={() => setSize('zeilen4')}
        aria-pressed={size === 'zeilen4'}
        aria-label="Zeilen 4"
        title="Zeilen 4"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Zeilen 4
      </button>

      <button
        type="button"
        className={`link zeichen_groesse_8${size === 'zeilen8' ? ' active' : ''}`}
        onClick={() => setSize('zeilen8')}
        aria-pressed={size === 'zeilen8'}
        aria-label="Zeilen 8"
        title="Zeilen 8"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Zeilen 8
      </button>

      <button
        type="button"
        className={`link zeichen_groesse_16${size === 'zeilen16' ? ' active' : ''}`}
        onClick={() => setSize('zeilen16')}
        aria-pressed={size === 'zeilen16'}
        aria-label="Zeilen 16"
        title="Zeilen 16"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Zeilen 16
      </button>

      <button
        type="button"
        className={`link zeichen_nicht_bold${!bold ? ' active' : ''}`}
        onClick={() => { if (hasActive && bold) toggleBold() }}
        aria-pressed={!bold}
        aria-label="Nicht Bold"
        title="Nicht Bold"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Nicht Bold
      </button>

      <button
        type="button"
        className={`link zeichen_bold${bold ? ' active' : ''}`}
        onClick={() => { if (hasActive && !bold) toggleBold() }}
        aria-pressed={bold}
        aria-label="Bold"
        title="Bold"
        disabled={!hasActive}
        aria-disabled={!hasActive}
      >
        Bold
      </button>
    </div>
  )
}
