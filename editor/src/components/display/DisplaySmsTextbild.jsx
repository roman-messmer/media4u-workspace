// src/components/display/DisplaySmsTextbild.jsx
import React, { useMemo, forwardRef, useCallback } from 'react'
import '../display/DisplaySmsTextbild.css'
import Console from "../console/Console"
import { useFrameNav } from '../../context/FrameNavContext'

function computeCenteredCol(totalCols, cspan = 1) {
  const start = Math.floor((totalCols - cspan) / 2) + 1
  return Math.max(1, Math.min(start, Math.max(1, totalCols - cspan + 1)))
}

const DisplaySmsTextbild = forwardRef(function DisplaySmsTextbild({
  rows = 32,
  cols = 64,
  frames = [],
  current = 0,
  onPrev,
  onNext,
  onRestart,
  onStop
}, ref) {
  const { isItemActive, setActive, toggleItem } = useFrameNav()

  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${cols}, 1ch)`,
    gridTemplateRows: `repeat(${rows}, 1em)`
  }), [rows, cols])

  const handlePreClick = useCallback((ii, e) => {
    if (e.ctrlKey || e.metaKey) toggleItem(current, ii)
    else setActive(current, ii)
  }, [current, setActive, toggleItem])

  const last = Math.max(0, frames.length - 1)

  return (
    <figure className="sms_textbild">
      <div
        ref={ref}
        className="display deselect"
        style={gridStyle}
        aria-live="polite"
        aria-busy="false"
        data-testid="sms-display"
      >
        {frames.map((items = [], idx) => (
          <div key={idx} className={`frame${idx === current ? ' show' : ''}`} data-testid={`frame-${idx}`}>
            {items.map((it, i) => {
              const row = Math.max(1, Math.min(rows, it.row ?? 1))
              const baseCol = Math.max(1, Math.min(cols, it.col ?? 1))
              const renderCol = it.center ? computeCenteredCol(cols, 1) : baseCol
              const activeHere = idx === current && isItemActive(current, i)

              const classes = [
                'zeilen',
                'zeilen4',
                it.center ? 'center' : '',
                activeHere ? 'active' : '',
              ].filter(Boolean).join(' ')

              return (
                <pre
                  key={i}
                  className={classes}
                  style={{ gridArea: `${row} / ${renderCol} / span 1 / span 1` }}
                  data-row={row}
                  data-col={baseCol}
                  data-rspan="1"
                  data-cspan="1"
                  data-index={i}
                  data-frameindex={idx}
                  data-center={it.center ? '1' : '0'}
                  aria-current={activeHere ? 'true' : undefined}
                  tabIndex={0}
                  onClick={(e) => handlePreClick(i, e)}
                >
                  {it.text ?? ''}
                </pre>
              )
            })}
          </div>
        ))}
      </div>

      <figcaption>
        <Console 
  label="Display Console SMS-Textbild" 
  onPrev={onPrev} 
  onRestart={onRestart} 
  onStop={onStop} 
  onNext={onNext} 
  current={current} 
  last={last} 
/>
      </figcaption>
    </figure>
  )
})

export default DisplaySmsTextbild
