// src/components/frame_list/FrameListTextbild2.jsx
import React, { useEffect } from 'react'
import '../frame_list/FrameList.css'
import { useFrameNav } from '../../context/FrameNavContext'
import icWord from '../../assets/file-word.svg'

/**
 * Props:
 * - frames: Array<Array<{ text: string, col: number, row: number }>>
 * - current: number
 * - onSelect?: (frameIndex: number) => void
 */
export default function FrameListTextbild2({ frames = [], current = 0, onSelect }) {
  // useFrameNav ist optional verdrahtet
  const nav = (() => {
    try { return useFrameNav?.() ?? {} } catch { return {} }
  })()
  const {
    setTotal,
    setCurrent,                 // optionaler Fallback, wenn kein onSelect übergeben wird
    isItemActive,
    toggleItem,
    getItemText,
  } = nav

  useEffect(() => { setTotal?.(frames.length) }, [frames.length, setTotal])

  const handleSelectFrame = (idx) => {
    if (typeof onSelect === 'function') onSelect(idx)
    else setCurrent?.(idx)
  }

  const resolveText = (fi, ii, fallback) =>
    typeof getItemText === 'function' ? getItemText(fi, ii, fallback) : fallback

  const isActiveItem = (fi, ii) =>
    typeof isItemActive === 'function' ? isItemActive(fi, ii) : false

  const handleToggleItem = (fi, ii) => {
    if (typeof toggleItem === 'function') toggleItem(fi, ii)
  }

  return (
    <div className="frame_list_textbild2" aria-label="Frame List Textbild2">
      {frames.map((frameItems = [], idx) => (
        <ul
          key={idx}
          className={`frame_group${idx === current ? ' show' : ''}`}
          onClick={() => handleSelectFrame(idx)}
          role="list"
          aria-current={idx === current ? 'true' : undefined}
        >
          {frameItems.map((item, i) => {
            const activeHere = idx === current && isActiveItem(idx, i)
            const resolvedText = resolveText(idx, i, item?.text ?? '')
            const showWordIcon = typeof resolvedText === 'string' && resolvedText.length > 1

            return (
              <li
                key={i}
                className={`group_item${activeHere ? ' edit' : ''}`}
                role="listitem"
                onClick={(e) => {
                  e.stopPropagation()
                  if (idx === current) handleToggleItem(idx, i)
                }}
                title={typeof resolvedText === 'string' ? resolvedText : ''}
              >
                {showWordIcon ? (
                  <img src={icWord} alt="Wort" className="icon-word" />
                ) : (
                  resolvedText
                )}
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}
