// src/components/zeichen/Zeichen.jsx
import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react'
import { useFrameNav } from '../../context/FrameNavContext'

import '../../../fonts/fonts.css'

export default function Zeichen() {
  const taRef = useRef(null)
  const { current, getPrimaryActiveText, setTextForActiveItems, activeStamp } = useFrameNav()
  const [value, setValue] = useState('')

  // Textarea immer mit dem Text des primär aktiven Elements füttern
  useEffect(() => {
    setValue(getPrimaryActiveText() ?? '')
  }, [current, activeStamp, getPrimaryActiveText])

  const SYMBOLS = useMemo(() => {
    const digits = [...'0123456789']
    const latinUpper = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
    const latinLower = [...'abcdefghijklmnopqrstuvwxyz']
    const gsmDefault = [
      '@','£','$','¥','è','é','ù','ì','ò','Ç',
      'Ø','ø','Å','å','_','Æ','æ','ß','É',
      '!','"','#','¤','%','&',"'",'(',')',
      '*','+',',','-','.','/',';',':','<','=','>','?',
      '¡','Ä','Ö','Ñ','Ü','§','¿','ä','ö','ñ','ü','à'
    ]
    const gsmExt = ['^','\\','[',']','~','|','€']
    const ordered = [...digits, ...latinUpper, ...latinLower, ...gsmDefault, ...gsmExt]
    const seen = new Set()
    return ordered.filter(ch => {
      if (ch === '\n') return false
      if (seen.has(ch)) return false
      seen.add(ch)
      return true
    })
  }, [])

  const insertAtCursor = useCallback((text) => {
  if (!taRef.current) return
  const ta = taRef.current
  const { selectionStart, selectionEnd, value: cur } = ta
  const next = cur.slice(0, selectionStart) + text + cur.slice(selectionEnd)
  setValue(next)
  setTextForActiveItems(next) // persistiert ins Modell
  const pos = selectionStart + text.length
  requestAnimationFrame(() => {
    // Fokus beibehalten, aber kein Scroll-Jump:
    ta.focus({ preventScroll: true })
    ta.setSelectionRange(pos, pos)
  })
}, [setTextForActiveItems])

  const onChange = useCallback((e) => {
    const next = e.target.value
    setValue(next)
    setTextForActiveItems(next) // persistiert ins Modell
  }, [setTextForActiveItems])

  return (
    <div className="textarea" id="zeichen-panel">
      <textarea
        ref={taRef}
        rows={16}
        aria-label="Textfeld für Zeichen"
        value={value}
        onChange={onChange}
        style={{ fontFamily: "'NokiaFC22'" }}
      />
      <ul className="zeichen_liste" aria-label="Zeichenliste Nokia GSM 03.38">
        {SYMBOLS.map((ch, i) => (
          <li key={`${ch}-${i}`}>
            <button
              type="button"
              className="zeichen_btn"
              onClick={() => insertAtCursor(ch)}
              aria-label={`Zeichen ${ch}`}
              title={ch}
              style={{ fontFamily: "'NokiaFC22'" }}
            >
              {ch}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
