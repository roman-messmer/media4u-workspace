// src/pages/Textbild2Page.jsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'

import WorkspaceTextbild2 from '../workspaces/WorkspaceTextbild2'
import OptionenPre from '../components/optionen_pre/OptionenPre'
import OptionenFrameTextbild2 from '../components/optionen_frame/OptionenFrameTextbild2'
import FrameListTextbild2 from '../components/frame_list/FrameListTextbild2'
import Quellcode from '../components/quellcode/Quellcode'

import { UiToggleProvider } from '../context/UiToggleContext'
import { FrameNavProvider } from '../context/FrameNavContext'
import { usePersistentEditor } from '../utils/usePersistentEditor'

const GRID = { rows: 48, cols: 128 }
const SIZE_CLASSES = ['zeilen1','zeilen2','zeilen4','zeilen8','zeilen16']
const normClasses = (arr = []) => {
  const a = Array.isArray(arr) ? arr : []
  const size = a.find(c => SIZE_CLASSES.includes(c)) || 'zeilen4'
  const rest = a.filter(c => !SIZE_CLASSES.includes(c))
  return Array.from(new Set([size, ...rest]))
}

const NEW_FRAME_ITEM = { text: '#', col: 1, row: 1, center: false, classes: ['zeilen4'] }

function normalizeTb2State(state) {
  const toInt = (v, d) => {
    const n = Number.parseInt(String(v), 10)
    return Number.isFinite(n) ? n : d
  }
  const fallback = { frames: [[{ ...NEW_FRAME_ITEM }]], current: 0 }
  const safe = state && typeof state === 'object' ? state : fallback
  const frames = Array.isArray(safe.frames) ? safe.frames : fallback.frames

  const normFrames = frames.map(items =>
    Array.isArray(items)
      ? items.map(it => ({
          text: it?.text ?? '',
          row:   toInt(it?.row, 1),
          col:   toInt(it?.col, 1),
          center: Boolean(it?.center),
          classes: normClasses(it?.classes),
        }))
      : [{ ...NEW_FRAME_ITEM }]
  )

  const current = Number.isFinite(Number(safe.current))
    ? Math.max(0, Math.min(normFrames.length - 1, Number(safe.current)))
    : 0

  return { frames: normFrames, current }
}

export default function Textbild2Page() {
  const displayRef = useRef(null)

  const { state, setState, saveNow } = usePersistentEditor(
    'editor:textbild2',
    { frames: [[{ ...NEW_FRAME_ITEM }]], current: 0 },
    { version: 3, normalize: normalizeTb2State }
  )

  const frames = state.frames
  const current = state.current
  const setFrames = (updater) => setState(s => ({ ...s, frames: typeof updater === 'function' ? updater(s.frames) : updater }))
  const setCurrent = (val) => setState(s => ({ ...s, current: typeof val === 'function' ? val(s.current) : val }))

  const [isCodeOpen, setIsCodeOpen] = useState(false)

  const goPrev     = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const goNext     = useCallback(() => setCurrent(c => Math.min(frames.length - 1, c + 1)), [frames.length])
  const goRestart  = useCallback(() => setCurrent(0), [])
  const goStop     = useCallback(() => setCurrent(c => Math.max(0, Math.min(c, frames.length - 1))), [frames.length])

  const getSelectedItemIndices = useCallback(() => {
    const root = document.querySelector('figure.textbild2 .display')
    const frameEl = root?.querySelector('.frame.show') || null
    const listRoot = document.querySelector('.wrapper_frame_list .frame_list') || document.querySelector('.frame_list')
    const groupEl = listRoot?.querySelector('.frame_group.show') || null
    if (!frameEl || !groupEl) return []

    const preAll = Array.from(frameEl.querySelectorAll('pre'))
    const preActiveIdx = Array.from(frameEl.querySelectorAll('pre.active'))
      .map(el => preAll.indexOf(el)).filter(i => i >= 0)

    const liAll = Array.from(groupEl.querySelectorAll('li'))
    const liEditIdx = Array.from(groupEl.querySelectorAll('li.edit'))
      .map(li => liAll.indexOf(li)).filter(i => i >= 0)

    return Array.from(new Set(preActiveIdx.filter(i => liEditIdx.includes(i)))).sort((a, b) => a - b)
  }, [])

  const clearSelectionClasses = useCallback(() => {
    const frameEl = document.querySelector('figure.textbild2 .display .frame.show')
    frameEl?.querySelectorAll('pre.active').forEach(el => { el.classList.remove('active'); el.removeAttribute('aria-current') })
    const listRoot = document.querySelector('.wrapper_frame_list .frame_list') || document.querySelector('.frame_list')
    const groupEl = listRoot?.querySelector('.frame_group.show') || null
    groupEl?.querySelectorAll('li.edit').forEach(li => { li.classList.remove('edit'); li.removeAttribute('aria-current') })
  }, [])

  const handleFrameAction = useCallback((id) => {
    if (id === 'save') { saveNow(); return }
    if (id === 'code') { setIsCodeOpen(true); return }

    if (id === 'new') {
      setFrames(prev => {
        const next = [...prev, [{ ...NEW_FRAME_ITEM }]]
        setCurrent(next.length - 1)
        return next
      }); return
    }
    if (id === 'clone') {
      setFrames(prev => {
        const cloned = JSON.parse(JSON.stringify(prev[current] ?? []))
        const next = [...prev]
        next.splice(current + 1, 0, cloned)
        setCurrent(current + 1)
        return next
      }); return
    }
    if (id === 'delete') {
      setFrames(prev => {
        const next = prev.filter((_, i) => i !== current)
        if (!next.length) { setCurrent(0); return [[{ ...NEW_FRAME_ITEM }]] }
        setCurrent(Math.max(0, Math.min(current, next.length - 1)))
        return next
      }); return
    }
    if (id === 'up') {
      setFrames(prev => {
        if (current <= 0) return prev
        const next = [...prev]
        ;[next[current - 1], next[current]] = [next[current], next[current - 1]]
        setCurrent(current - 1)
        return next
      }); return
    }
    if (id === 'down') {
      setFrames(prev => {
        if (current >= prev.length - 1) return prev
        const next = [...prev]
        ;[next[current + 1], next[current]] = [next[current], next[current + 1]]
        setCurrent(current + 1)
        return next
      }); return
    }
  }, [current, saveNow])

  const ALIGN_IDS = useMemo(() => new Set(['align', 'align-center', 'center']), [])
  const MOVE_DELTAS = useMemo(() => ({
    left:  { dx: -1, dy:  0 },
    right: { dx:  1, dy:  0 },
    up:    { dx:  0, dy: -1 },
    down:  { dx:  0, dy:  1 },
  }), [])

  const handlePreAction = useCallback((id, payload) => {
    if (!['new','clone','delete','left','right','up','down','align','align-center','center','ascii'].includes(id)) return

    setFrames(prevFrames => {
      const fi = current
      const framesCopy = prevFrames.map((arr, i) => (i === fi ? arr.map(it => ({ ...it })) : arr))
      const items = framesCopy[fi] || []

      if (id === 'new') {
        items.push({ ...NEW_FRAME_ITEM, text: '' })
        framesCopy[fi] = items
        return framesCopy
      }

      if (id === 'clone') {
        if (items.length) {
          const selected = getSelectedItemIndices()
          if (selected.length) {
            const clones = selected.map(i => ({ ...items[i] }))
            const insertAfter = selected[selected.length - 1]
            items.splice(insertAfter + 1, 0, ...clones)
            framesCopy[fi] = items
            return framesCopy
          }
          items.splice(items.length, 0, { ...items[items.length - 1] })
          framesCopy[fi] = items
        }
        return framesCopy
      }

      if (id === 'delete') {
        if (items.length) {
          const selected = getSelectedItemIndices()
          if (selected.length) selected.slice().sort((a, b) => b - a).forEach(i => items.splice(i, 1))
          if (!items.length) items.push({ ...NEW_FRAME_ITEM, text: '' })
          framesCopy[fi] = items
          requestAnimationFrame(clearSelectionClasses)
        }
        return framesCopy
      }

      if (ALIGN_IDS.has(id)) {
        const indices = payload?.indices ?? getSelectedItemIndices()
        if (!indices.length) return prevFrames
        indices.forEach(i => { if (i >= 0 && i < items.length) items[i].center = !items[i].center })
        framesCopy[fi] = items
        return framesCopy
      }

      if (id === 'ascii') {
        const indices = payload?.indices ?? getSelectedItemIndices()
        if (!indices.length) return prevFrames
        indices.forEach(i => {
          if (i < 0 || i >= items.length) return
          const cls = Array.isArray(items[i].classes) ? items[i].classes.slice() : ['zeilen4']
          items[i].classes = cls.includes('ascii') ? cls.filter(c => c !== 'ascii') : [...cls, 'ascii']
        })
        framesCopy[fi] = items
        return framesCopy
      }

      if (id in MOVE_DELTAS) {
        const { dx, dy } = MOVE_DELTAS[id]
        const indices = getSelectedItemIndices()
        if (!indices.length) return prevFrames
        indices.forEach(i => {
          if (i >= 0 && i < items.length) {
            const it = items[i]
            const nx = Math.max(1, Math.min(GRID.cols, (it.col ?? 1) + dx))
            const ny = Math.max(1, Math.min(GRID.rows, (it.row ?? 1) + dy))
            it.col = nx
            it.row = ny
          }
        })
        framesCopy[fi] = items
        return framesCopy
      }

      return prevFrames
    })
  }, [current, getSelectedItemIndices, clearSelectionClasses, ALIGN_IDS, MOVE_DELTAS])

  const frameNavProps = useMemo(() => ({
    initial: 0,
    initialTotal: frames.length,
    readItemText: (fi, ii) => frames?.[fi]?.[ii]?.text ?? '',
    writeItemText: (fi, ii, text) => {
      setState(s => {
        if (!s.frames?.[fi]?.[ii]) return s
        const frames = s.frames.map((arr, idx) => (idx === fi ? arr.map((it, j) => (j === ii ? { ...it, text } : it)) : arr))
        return { ...s, frames }
      })
    },
    readItemClasses: (fi, ii) => frames?.[fi]?.[ii]?.classes ?? [],
    writeItemClasses: (fi, ii, classes) => {
      setState(s => {
        if (!s.frames?.[fi]?.[ii]) return s
        const frames = s.frames.map((arr, idx) => (idx === fi ? arr.map((it, j) => (j === ii ? { ...it, classes: normClasses(classes) } : it)) : arr))
        return { ...s, frames }
      })
    },
  }), [frames, setState])

  const last = useMemo(() => Math.max(0, frames.length - 1), [frames.length])

  return (
    <UiToggleProvider>
      <FrameNavProvider {...frameNavProps}>
        <main className="textbild2_page">
          <div className="wrapper wrapper_display">
            <div className="container display">
              
                <WorkspaceTextbild2
                  ref={displayRef}
                  rows={GRID.rows}
                  cols={GRID.cols}
                  frames={frames}
                  current={current}
                  onPrev={goPrev}
                  onNext={goNext}
                  onRestart={goRestart}
                  onStop={goStop}
                />
              
            </div>
          </div>

          <div className="wrapper wrapper_optionen_frame">
            <div className="container optionen_frame">
              <OptionenFrameTextbild2 onAction={handleFrameAction} />
            </div>
          </div>

          <div className="wrapper wrapper_optionen_pre" style={{ '--bg-optionen-pre': '#89cee1' }}>
            <div className="container optionen_pre">
              <OptionenPre variant="textbild2" includePanel={false} onAction={handlePreAction} />
            </div>
          </div>

          <div className="wrapper wrapper_frame_list" style={{ '--bg-frame-list': '#89cee1' }}>
            <div className="container frame_list">
              <FrameListTextbild2
                frames={frames}
                current={current}
                onSelect={setCurrent}
              />
            </div>
          </div>

          <div className="wrapper wrapper_quellcode">
            <div className="container quellcode-wrap">
              <Quellcode
                isOpen={isCodeOpen}
                onClose={() => setIsCodeOpen(false)}
                variant="textbild2"
                displayRef={displayRef}
              />
            </div>
          </div>
        </main>
      </FrameNavProvider>
    </UiToggleProvider>
  )
}
