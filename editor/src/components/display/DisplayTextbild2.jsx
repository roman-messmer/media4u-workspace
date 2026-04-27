// src/components/display/DisplayTextbild2.jsx
import React, { forwardRef, useEffect, useMemo, useCallback } from 'react'
import './DisplayTextbild2.css'
import Console from '../console/Console'
import { useFrameNav } from '../../context/FrameNavContext'
import { computeCenteredCol } from '../../utils/grid'

const DisplayTextbild2 = forwardRef(function DisplayTextbild2(
  { rows = 48, cols = 128, frames = [], current = 0, onPrev, onNext, onRestart, onStop },
  ref
) {
  const nav = useFrameNav?.()
  const setTotal = nav?.setTotal
  const isItemActive = nav?.isItemActive
  const setActive = nav?.setActive
  const toggleItem = nav?.toggleItem
  const getItemText = nav?.getItemText

  useEffect(() => { setTotal?.(frames.length) }, [frames.length, setTotal])

  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${cols}, 4px)`,
    gridTemplateRows: `repeat(${rows}, 4px)`,
  }), [cols, rows])

  const onDblClick = useCallback((e) => { e.preventDefault(); e.stopPropagation() }, [])

  const handlePreClick = useCallback((frameIndex, itemIndex, e) => {
    if (e.ctrlKey || e.metaKey) toggleItem?.(frameIndex, itemIndex)
    else setActive?.(frameIndex, itemIndex)
  }, [setActive, toggleItem])

  const handlePreKeyDown = useCallback((frameIndex, itemIndex, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const fake = { ctrlKey: e.ctrlKey, metaKey: e.metaKey }
      handlePreClick(frameIndex, itemIndex, fake)
    }
  }, [handlePreClick])

  const last = useMemo(() => Math.max(0, frames.length - 1), [frames.length])

  return (
    <figure className="textbild2" onDoubleClick={onDblClick}>
        <div
          ref={ref}
          className="display deselect"
          data-variant="textbild2"
          aria-live="polite"
          aria-busy="false"
          style={gridStyle}
        >
          {frames.map((preList = [], idx) => (
            <div key={idx} className={`frame${idx === current ? ' show' : ''}`}>
              {preList.map((item, i) => {
                const rspan = Math.max(1, item?.rspan ?? 1)
                const cspan = Math.max(1, item?.cspan ?? 1)
                const row   = Math.max(1, Math.min(rows, Number(item?.row ?? 1)))
                const colIn = Math.max(1, Math.min(cols, Number(item?.col ?? 1)))
                const centered = !!item?.center
                const renderCol = centered ? computeCenteredCol(cols, cspan) : colIn
                const gridArea  = `${row} / ${renderCol} / span ${rspan} / span ${cspan}`

                const rawText = item?.text ?? ''
                const text = typeof getItemText === 'function' ? getItemText(idx, i, rawText) : rawText

                const active = idx === current && (typeof isItemActive === 'function' ? isItemActive(idx, i) : false)
                const extra = Array.isArray(item?.classes) ? item.classes : []
                const SIZE_CLASSES = ['zeilen1','zeilen2', 'zeilen4', 'zeilen8', 'zeilen16']
                const sizeClass = extra.find(c => SIZE_CLASSES.includes(c)) || 'zeilen4'

                const cls = [
                  'zeilen',
                  sizeClass,
                  centered ? 'center' : '',
                  active ? 'active' : '',
                  ...extra.filter(c => !SIZE_CLASSES.includes(c)),
                ].filter(Boolean).join(' ')

                return (
                  <pre
                    key={i}
                    className={cls}
                    style={{ gridArea }}
                    data-row={row}
                    data-col={colIn}
                    data-gridrow={row}
                    data-gridcol={renderCol}
                    data-rspan={rspan}
                    data-cspan={cspan}
                    data-index={i}
                    data-frameindex={idx}
                    data-center={centered ? '1' : '0'}
                    aria-current={active ? 'true' : undefined}
                    role="button"
                    aria-pressed={active ? 'true' : 'false'}
                    tabIndex={0}
                    onClick={(e) => handlePreClick(idx, i, e)}
                    onKeyDown={(e) => handlePreKeyDown(idx, i, e)}
                  >
                    {text}
                  </pre>
                )
              })}
            </div>
          ))}
        </div>

        <figcaption>
          <Console 
  label="Display Console Textbild 2" 
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

export default DisplayTextbild2
