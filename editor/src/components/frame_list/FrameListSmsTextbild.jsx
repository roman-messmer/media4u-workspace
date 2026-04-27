// src/components/frame_list/FrameListSmsTextbild.jsx
import React, { useEffect } from 'react'
import '../frame_list/FrameList.css'
import { useFrameNav } from '../../context/FrameNavContext'
import icWord from '../../assets/file-word.svg'

export default function FrameListSmsTextbild({ frames = [], current = 0, onSelect }) {
  const { setTotal, isItemActive, toggleItem, getItemText, ensurePrimaryActive } = useFrameNav()

  useEffect(() => { setTotal?.(frames.length) }, [frames.length, setTotal])

  return (
    <div className="frame_list_sms_textbild" aria-label="Frame List SMS Textbild">
      {frames.map((frameItems = [], idx) => (
        <ul
          key={idx}
          className={`frame_group${idx === current ? ' show' : ''}`}
          role="list"
          aria-current={idx === current ? 'true' : undefined}
          onClick={() => {
            onSelect?.(idx)          // setzt current im App-State
          }}
        >
          {frameItems.length === 0 ? (
            <li className="group_item" role="listitem" title="leer">·</li>
          ) : (
            frameItems.map((item, i) => {
              const activeHere = idx === current && (isItemActive?.(idx, i) ?? false)
              const resolvedText =
                getItemText?.(idx, i, item.text ?? '') ?? (item.text ?? '')
              const showWordIcon = typeof resolvedText === 'string' && resolvedText.length > 1
              return (
                <li
                  key={i}
                  className={`group_item${activeHere ? ' edit' : ''}`}
                  role="listitem"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (idx === current) toggleItem?.(idx, i)
                  }}
                  title={resolvedText}
                >
                  {showWordIcon ? (
                    <img src={icWord} alt="Wort" className="icon-word" />
                  ) : (
                    resolvedText
                  )}
                </li>
              )
            })
          )}
        </ul>
      ))}
    </div>
  )
}
