// src/components/quellcode/QuellcodeSmsTextbild.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../quellcode/Quellcode.css'

const pretty = (s = '') => s.replaceAll('><', '>\n<').trim()

const escapeHtml = (s = '') =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/**
 * Holt einen Wert direkt aus dem Inline-Style String (grid-area).
 * Das spiegelt exakt wider, was React in das style-Attribut geschrieben hat.
 * Format erwartet: "row / col / rowSpan / colSpan"
 */
function getFromInlineStyle(el, index) {
  // Wir lesen hier strikt el.style.gridArea.
  // Das ist der String, der im HTML steht (z.B. "2 / 42 / span 1 / span 1").
  if (!el.style.gridArea) return null
  const parts = el.style.gridArea.split('/')
  return parts[index] ? parts[index].trim() : null
}

/**
 * Extrahiert die Zahl aus "span X" oder berechnet die Differenz.
 */
function extractSpan(val) {
  if (!val) return 1
  const s = String(val).trim()
  
  // Fall: "span 2"
  if (s.toLowerCase().startsWith('span')) {
    const n = parseInt(s.split(/\s+/)[1], 10)
    return Number.isFinite(n) && n > 0 ? n : 1
  }
  
  // Fall: Nur eine Zahl (kommt im Shorthand selten vor, aber zur Sicherheit)
  const n = parseInt(s, 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * Baut den grid-area String zusammen, basierend auf dem, was im DOM steht.
 */
function readGridAreaFromDom(el) {
  // 1. Versuche ALLES aus dem Inline-Style zu holen. Das ist die visuelle Wahrheit.
  // Index: 0=Row, 1=Col, 2=RowEnd/Span, 3=ColEnd/Span
  const styleRow = getFromInlineStyle(el, 0)
  const styleCol = getFromInlineStyle(el, 1)
  const styleRS  = getFromInlineStyle(el, 2)
  const styleCS  = getFromInlineStyle(el, 3)

  // 2. Fallback: Nur wenn im Style nichts steht, nehmen wir Dataset (sollte kaum passieren)
  const rowStart = styleRow || el.dataset.row || '1'
  const colStart = styleCol || el.dataset.col || '1'
  
  // 3. Spans berechnen
  // Wir bevorzugen das, was im Style als "span X" steht
  const rawRowSpan = styleRS || (el.dataset.rspan ? `span ${el.dataset.rspan}` : 'span 1')
  const rawColSpan = styleCS || (el.dataset.cspan ? `span ${el.dataset.cspan}` : 'span 1')

  const rowSpan = extractSpan(rawRowSpan)
  const colSpan = extractSpan(rawColSpan)

  // 4. String zusammenbauen
  return `grid-area: ${rowStart} / ${colStart} / span ${rowSpan} / span ${colSpan};`
}

function serializePre(preEl) {
  // Klassennamen übernehmen (z.B. "zeilen zeilen4 center active")
  const cls = preEl.className || ''
  
  // Style exakt aus dem DOM lesen
  const styleLine = readGridAreaFromDom(preEl)
  
  // Inhalt
  const text = escapeHtml(preEl.textContent ?? '')
  
  return `<pre class="${cls}" style="${styleLine}">${text}</pre>`
}

function serializeFrame(frameEl) {
  const frameClass = frameEl.className || 'frame'
  const pres = Array.from(frameEl.querySelectorAll('pre'))
  const presHtml = pres.map(serializePre).join('\n')
  return `<div class="${frameClass}">\n${presHtml}\n</div>`
}

export default function QuellcodeSmsTextbild({ isOpen = false, onClose, displayRef }) {
  const [code, setCode] = useState('')
  // Wir brauchen kein Ref für das pre selbst hier, nur den State

  // Ziel ist das Display-Element (entweder via Ref übergeben oder global gesucht)
  const target = useMemo(
    () => displayRef?.current || document.querySelector('.display'),
    [displayRef]
  )

  useEffect(() => {
    if (!isOpen) return

    const collect = () => {
      if (!target) {
        setCode('')
        return
      }
      // Wir holen uns alle Frames
      const frames = Array.from(target.querySelectorAll('.frame'))
      if (!frames.length) {
        setCode('')
        return
      }
      // Wir serialisieren exakt das, was da ist
      const html = frames.map(serializeFrame).join('\n')
      setCode(pretty(html))
    }

    // Sofort ausführen
    collect()

    // Beobachten: Wenn sich Attribute (class, style) ändern, Quellcode updaten
    let raf = 0
    const obs = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(collect)
    })
    
    if (target) {
      obs.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ['style', 'class', 'data-col', 'data-row'] 
      })
    }

    const onEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onEsc)

    return () => {
      window.removeEventListener('keydown', onEsc)
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [isOpen, onClose, target])

  if (!isOpen) return null

  return (
    <div className="quellcode" role="region" aria-label="Quellcode" aria-live="polite" aria-busy="false">
      <pre className="code" tabIndex={-1}>
        <code>{code || '/* Keine .frame Elemente gefunden */'}</code>
      </pre>
    </div>
  )
}