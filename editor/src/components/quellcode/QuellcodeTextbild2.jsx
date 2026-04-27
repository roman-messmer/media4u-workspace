// src/components/quellcode/QuellcodeTextbild2.jsx
import React, { useEffect, useRef, useState } from 'react'
import '../quellcode/Quellcode.css'

const pretty = (s = '') => s.replaceAll('><', '>\n<').trim()

const escapeHtml = (s = '') =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

function extractSpan(endVal, startVal) {
  if (!endVal) return 1
  const trimmed = String(endVal).trim()
  if (trimmed.startsWith('span')) {
    const n = parseInt(trimmed.split(/\s+/)[1], 10)
    return Number.isFinite(n) && n > 0 ? n : 1
  }
  const endNum = parseInt(trimmed, 10)
  const startNum = parseInt(String(startVal ?? ''), 10)
  if (Number.isFinite(endNum) && Number.isFinite(startNum)) {
    const diff = endNum - startNum
    return diff > 0 ? diff : 1
  }
  return 1
}

function toGridAreaShorthand(el) {
  const cs = window.getComputedStyle(el)

  // FIX: Priorität auf data-gridrow (berechnet) statt data-row (Input)
  const rowStart =
    el.dataset.gridrow ||
    el.dataset.row ||
    el.style.gridRowStart ||
    cs.gridRowStart ||
    '1'

  // FIX: Priorität auf data-gridcol (berechnet/zentriert) statt data-col (Input)
  const colStart =
    el.dataset.gridcol ||
    el.dataset.col ||
    el.style.gridColumnStart ||
    cs.gridColumnStart ||
    '1'

  const rowSpan =
    el.dataset.rspan ||
    extractSpan(el.style.gridRowEnd || cs.gridRowEnd, rowStart)

  const colSpan =
    el.dataset.cspan ||
    extractSpan(el.style.gridColumnEnd || cs.gridColumnEnd, colStart)

  const r = /^\d+$/.test(String(rowStart)) ? rowStart : '1'
  const c = /^\d+$/.test(String(colStart)) ? colStart : '1'
  const rs = /^\d+$/.test(String(rowSpan)) ? rowSpan : '1'
  const csn = /^\d+$/.test(String(colSpan)) ? colSpan : '1'

  return `grid-area: ${r} / ${c} / span ${rs} / span ${csn};`
}

const RUNTIME_CLASSES = new Set(['show', 'active', 'edit'])

function serializePre(preEl) {
  const cls = (preEl.className || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter(c => !RUNTIME_CLASSES.has(c))
    .join(' ')
  const styleLine = toGridAreaShorthand(preEl)
  const text = escapeHtml(preEl.textContent ?? '')
  return cls
    ? `<pre class="${cls}" style="${styleLine}">${text}</pre>`
    : `<pre style="${styleLine}">${text}</pre>`
}

function serializeFrame(frameEl) {
  const frameClass = (frameEl.className || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter(c => !RUNTIME_CLASSES.has(c))
    .join(' ') || 'frame'
  const pres = Array.from(frameEl.querySelectorAll('pre'))
  const presHtml = pres.map(serializePre).join('\n')
  return `<div class="${frameClass}">\n${presHtml}\n</div>`
}

// direkte Frames unter target (Fallback ohne :scope)
function selectFramesStrict(target) {
  if (!target) return []
  try {
    return Array.from(target.querySelectorAll(':scope > .frame'))
  } catch {
    return Array.from(target.querySelectorAll('.frame')).filter(
      (el) => el.parentElement === target
    )
  }
}

export default function QuellcodeTextbild2({ isOpen = false, onClose, displayRef }) {
  const [code, setCode] = useState('')
  const preRef = useRef(null)

  // Observer und zuletzt beobachtetes Ziel verwalten
  const obsRef = useRef(null)
  const lastTargetRef = useRef(null)
  const rafRef = useRef(0)

  // Ziel dynamisch ermitteln
  const getTarget = () =>
    (displayRef?.current) ||
    document.querySelector('figure.textbild2 .display') ||
    null

  const collect = () => {
    const target = getTarget()
    if (!target) {
      setCode('')
      return
    }
    const frames = selectFramesStrict(target)
    if (!frames.length) {
      setCode('')
      return
    }
    const html = frames.map(serializeFrame).join('\n')
    setCode(pretty(html))
  }

  const bindObserver = () => {
    const target = getTarget()
    if (!target) {
      // später erneut versuchen
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(bindObserver)
      return
    }

    // nur neu binden, wenn Ziel sich geändert hat
    if (lastTargetRef.current !== target) {
      try { obsRef.current?.disconnect() } catch {}
      obsRef.current = new MutationObserver(() => {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          try { collect() } catch {}
        })
      })
      try {
        obsRef.current.observe(target, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        })
      } catch {}
      lastTargetRef.current = target
    }

    // initial sammeln
    try { collect() } catch {}
  }

  useEffect(() => {
    if (!isOpen) return

    // initiales Binden und ggf. Retry, bis Ziel existiert
    bindObserver()

    const onEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onEsc)

    // Falls das Ziel zur Laufzeit komplett neu gerendert wird,
    // alle paar Frames erneut prüfen, ob sich das Ziel geändert hat.
    let rebindId = 0
    const rebindLoop = () => {
      bindObserver()
      rebindId = requestAnimationFrame(rebindLoop)
    }
    rebindId = requestAnimationFrame(rebindLoop)

    return () => {
      window.removeEventListener('keydown', onEsc)
      try { obsRef.current?.disconnect() } catch {}
      lastTargetRef.current = null
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(rebindId)
    }
  }, [isOpen, onClose, displayRef])

  if (!isOpen) return null

  return (
    <div className="quellcode" role="region" aria-label="Quellcode" aria-live="polite" aria-busy="false">
      <pre ref={preRef} className="code" tabIndex={-1}>
        <code>{code || '/* Keine .frame Elemente gefunden */'}</code>
      </pre>
    </div>
  )
}