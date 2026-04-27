// src/components/zeichen/Zeichen2.jsx
import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react'
import { useFrameNav } from '../../context/FrameNavContext'

/**
 * Zeichen-Panel für Textbild2.
 * Nutzt bevorzugt FrameNav-APIs:
 *  - getPrimaryActiveText()
 *  - setTextForActiveItems(text)
 * Fallback: schreibt in aktive <pre> im aktuellen Frame innerhalb figure.textbild2.
 */
export default function Zeichen2() {
  const taRef = useRef(null)

  // FrameNav optional einbinden, robust gegen Abwesenheit
  const nav = (() => {
    try { return useFrameNav?.() ?? {} } catch { return {} }
  })()
  const {
    current = 0,
    getPrimaryActiveText,
    setTextForActiveItems,
  } = nav

  const [value, setValue] = useState('')

  const SYMBOLS = useMemo(() => {
    const digits = [...'0123456789']
    const latinUpper = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
    const latinLower = [...'abcdefghijklmnopqrstuvwxyz']
    const latinExtraUpper = ['Č','Ć','Đ','Š','Ž']
    const latinExtraLower = ['č','ć','đ','š','ž']
    const greekUpper = ['Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω']
    const greekLower = ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω','ά','Ά','έ','Έ','ή','Ή','ί','ϊ','ΐ','Ί','ό','Ό','ύ','ΰ','ϋ','Ύ','Ϋ','ά','έ','ή','ί','ό','ύ','ώ','Ώ']
    
    const cyrillicUpper = ['А','Б','В','Г','Ґ','Д','Ђ','Е','Ё','Є','Ж','З','Ѕ','И','І','Ї','Й','Ј','К','Л','Љ','М','Н','Њ','О','П','Р','С','Т','Ћ','У','Ў','Ф','Х','Ц','Ч','Џ','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я']
    const cyrillicLower = ['а','б','в','г','ґ','д','ђ','е','ё','є','ж','з','ѕ','и','і','ї','й','ј','к','л','љ','м','н','њ','о','п','р','с','т','ћ','у','ў','ф','х','ц','ч','џ','ш','щ','ъ','ы','ь','э','ю','я']
        
    const vietnamese = ['Ă','Â','Ê','Ô','Ơ','Ư','ă','â','ê','ô','ơ','ư']
    
    const punctuation = ['‘','’','“','”','"',"'",'(',')','[',']','{','}','/','\\','<','>','-','+','÷','×','=','®','©','$','€','£','¥','¢',':',';',',','.','*','_','^','~','°','¬','§','¦','|']
    const mathMisc = ['≈','≡','∼','∈','∧','∨','⊂','∪','π','◊','†','∫','·','∘','⌈','⌉','⌊','⌋']
    const extras   = ['‹','›','¿','Γ','∴','⌕']

    const ordered = [
      ...digits,
      ...latinUpper, ...latinExtraUpper,
      ...latinLower, ...latinExtraLower,
      ...greekUpper, ...greekLower,
      ...cyrillicUpper, ...cyrillicLower,
      ...vietnamese, ...punctuation,
      ...mathMisc, ...extras,
    ]

    const seen = new Set()
    return ordered.filter(ch => {
      if (ch === '\n' || ch === ' ') return false
      if (seen.has(ch)) return false
      seen.add(ch)
      return true
    })
  }, [])

  // DOM Fallback: aktiven PRE-Text lesen/schreiben
  const domReadActiveText = useCallback(() => {
    const root = document.querySelector('figure.textbild2 .display')
    if (!root) return ''
    const frames = Array.from(root.querySelectorAll('.frame'))
    const frame =
      frames?.[Math.max(0, Math.min(current, frames.length - 1))] ||
      root.querySelector('.frame.show') ||
      root
    const primary = frame.querySelector('pre.active') || frame.querySelector('pre')
    return primary?.textContent ?? ''
  }, [current])

  const domWriteActiveText = useCallback((text) => {
    const root = document.querySelector('figure.textbild2 .display')
    if (!root) return
    const frames = Array.from(root.querySelectorAll('.frame'))
    const frame =
      frames?.[Math.max(0, Math.min(current, frames.length - 1))] ||
      root.querySelector('.frame.show') ||
      root
    const targets = frame.querySelectorAll('pre.active')
    if (targets.length === 0) return
    targets.forEach(el => { el.textContent = text })
  }, [current])

  // Initialtext laden
  useEffect(() => {
    const initial = typeof getPrimaryActiveText === 'function'
      ? getPrimaryActiveText()
      : domReadActiveText()
    setValue(initial)
  }, [current, getPrimaryActiveText, domReadActiveText])

  // Einfügen am Cursor
  const insertAtCursor = useCallback((text) => {
    const ta = taRef.current
    if (!ta) return
    const { selectionStart, selectionEnd, value: cur } = ta
    const next = cur.slice(0, selectionStart) + text + cur.slice(selectionEnd)
    setValue(next)
    if (typeof setTextForActiveItems === 'function') setTextForActiveItems(next)
    else domWriteActiveText(next)
    const pos = selectionStart + text.length
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
  }, [setTextForActiveItems, domWriteActiveText])

  // Textarea Change
  const onChange = useCallback((e) => {
    const next = e.target.value
    setValue(next)
    if (typeof setTextForActiveItems === 'function') setTextForActiveItems(next)
    else domWriteActiveText(next)
  }, [setTextForActiveItems, domWriteActiveText])

  return (
    <div className="textarea" id="zeichen2-panel">
      <textarea
        ref={taRef}
        rows={16}
        aria-label="Textfeld für Zeichen"
        value={value}
        onChange={onChange}
      />
      <ul className="zeichen_liste" aria-label="Zeichenliste erweitert">
        {SYMBOLS.map((ch, i) => (
          <li key={`${ch}-${i}`}>
            <button
              type="button"
              className="zeichen_btn"
              onClick={() => insertAtCursor(ch)}
              aria-label={`Zeichen ${ch}`}
              title={ch}
            >
              {ch}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
