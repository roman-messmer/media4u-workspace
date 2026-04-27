// src/App.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import './Index.css'
import '../fonts/fonts.css'

import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import OptionenPre from './components/optionen_pre/OptionenPre'
import Auswahl from './components/auswahl/Auswahl'
import Quellcode from './components/quellcode/Quellcode'

import Display from './components/display/Display'

import WorkspaceSmsTextbild from './workspaces/WorkspaceSmsTextbild'
import FrameListSmsTextbild from './components/frame_list/FrameListSmsTextbild'
import OptionenFrameSmsTextbild from './components/optionen_frame/OptionenFrameSmsTextbild'

import WorkspaceTextbild2 from './workspaces/WorkspaceTextbild2'
import FrameListTextbild2 from './components/frame_list/FrameListTextbild2'
import OptionenFrameTextbild2 from './components/optionen_frame/OptionenFrameTextbild2'
import QuellcodeTextbild2 from './components/quellcode/QuellcodeTextbild2'

import { usePersistentEditor } from './utils/usePersistentEditor'
import { UiToggleProvider } from './context/UiToggleContext'
import { FrameNavProvider, useFrameNav } from './context/FrameNavContext'

// Vorlagen-Seite
import VorlagenPage from './pages/VorlagenPage'


import bgVorlagen from './assets/display_bg_vorlagen.png'
import bgTextbild2 from './assets/display_bg_textbild2.png'
import bgSmsTextbild from './assets/display_bg_sms_textbild.png'

const STYLE_MAP = [
  { test: (p) => p.startsWith('/sms_textbild'),     bg: bgSmsTextbild, color: '#82b59f', body: 'page-sms' },
  { test: (p) => p.startsWith('/textbild2'),        bg: bgTextbild2,   color: '#89cee1', body: 'page-textbild2' },
  { test: (p) => p.startsWith('/vorlagen'),         bg: bgVorlagen,    color: '#a7a7a7', body: 'page-vorlagen' },
]
const pickStyle = (pathname) =>
  STYLE_MAP.find((r) => r.test(pathname)) || { bg: bgVorlagen, color: '#a7a7a7', body: 'page-vorlagen' }

const GRID_SMS = { rows: 39, cols: 84 }
const GRID_TB2 = { rows: 48, cols: 128 }

const SIZE_CLASSES = ['zeilen1','zeilen2','zeilen4','zeilen8','zeilen16']
const normClasses = (arr = []) => {
  const a = Array.isArray(arr) ? arr : []
  const size = a.find(c => SIZE_CLASSES.includes(c)) || 'zeilen4'
  const rest = a.filter(c => !SIZE_CLASSES.includes(c))
  return Array.from(new Set([size, ...rest]))
}

const NEW_SMS_ITEM = { text: '#', col: 2, row: 2, center: false }
const NEW_TB2_ITEM = { text: '#', col: 1, row: 1, rspan: 1, cspan: 1, center: false, classes: ['zeilen4'] }

function normalizeSmsState(state) {
  const fallback = { frames: [[{ ...NEW_SMS_ITEM }]], current: 0 }
  const safe = state && typeof state === 'object' ? state : fallback
  const frames = Array.isArray(safe.frames) ? safe.frames : fallback.frames

  const normFrames = frames.map(items =>
    Array.isArray(items)
      ? items.map(it => ({
          text: it?.text ?? '',
          row: Number.isFinite(Number(it?.row)) ? Number(it?.row) : 2,
          col: Number.isFinite(Number(it?.col)) ? Number(it?.col) : 2,
          center: Boolean(it?.center),
        }))
      : [{ ...NEW_SMS_ITEM }]
  )

  const current = Number.isFinite(Number(safe.current))
    ? Math.max(0, Math.min(normFrames.length - 1, Number(safe.current)))
    : 0

  return { frames: normFrames, current }
}

function normalizeTb2State(state) {
  const toInt = (v, d) => {
    const n = Number.parseInt(String(v), 10)
    return Number.isFinite(n) ? n : d
  }

  const fallback = { frames: [[{ ...NEW_TB2_ITEM }]], current: 0 }
  const safe = state && typeof state === 'object' ? state : fallback
  const framesIn = Array.isArray(safe.frames) ? safe.frames : fallback.frames

  const normFrames = framesIn.map(items =>
    Array.isArray(items)
      ? items.map(it => ({
          text: it?.text ?? '',
          row:   Math.max(1, Math.min(GRID_TB2.rows, toInt(it?.row,   1))),
          col:   Math.max(1, Math.min(GRID_TB2.cols, toInt(it?.col,   1))),
          rspan: Math.max(1, toInt(it?.rspan, 1)),
          cspan: Math.max(1, toInt(it?.cspan, 1)),
          center: Boolean(it?.center),
          classes: normClasses(it?.classes),
        }))
      : [{ ...NEW_TB2_ITEM }]
  )

  const current = Number.isFinite(Number(safe.current))
    ? Math.max(0, Math.min(normFrames.length - 1, Number(safe.current)))
    : 0

  return { frames: normFrames, current }
}

function DisplayWrapper({ children }) {
  const location = useLocation()
  const style = useMemo(() => pickStyle(location.pathname), [location.pathname])

  const [state, setState] = useState(() => ({
    a: style.bg, b: style.bg, showA: true, isFading: false,
  }))
  const durationMs = 450
  const timeoutRef = useRef(null)

  useEffect(() => {
    const nextBg = style.bg
    const currentBg = state.showA ? state.a : state.b
    if (nextBg === currentBg) return
    const targetIsA = !state.showA
    setState(s => ({ ...s, [targetIsA ? 'a' : 'b']: nextBg, isFading: true }))
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setState(s => ({ ...s, showA: targetIsA })))
    )
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setState(s => ({ ...s, isFading: false })), durationMs)
    return () => clearTimeout(timeoutRef.current)
  }, [style.bg]) // eslint-disable-line

  const bgUrl = state.showA ? state.a : state.b

  return (
    <div className={`wrapper wrapper_display${state.isFading ? ' is-fading' : ''}`} style={{ backgroundImage: `url(${bgUrl})` }}>
      <div className="container display">
        <div className="display_area">{children}</div>
      </div>
    </div>
  )
}

function SmsEditorApp({ smsState, setSmsState, saveSmsNow, routeStyle }) {
  const { setTotal, setCurrent } = useFrameNav()

  const displayRef = useRef(null)
  const [isCodeOpen, setIsCodeOpen] = useState(false)

  useEffect(() => { setTotal?.(smsState.frames.length) }, [smsState.frames.length, setTotal])
  useEffect(() => { setCurrent?.(smsState.current) }, [smsState.current, setCurrent])

  const goPrev = useCallback(() => setSmsState(s => ({ ...s, current: Math.max(0, s.current - 1) })), [setSmsState])
  const goNext = useCallback(() => setSmsState(s => ({ ...s, current: Math.min(s.frames.length - 1, s.current + 1) })), [setSmsState])
  const goRestart = useCallback(() => setSmsState(s => ({ ...s, current: 0 })), [setSmsState])
  const goStop = useCallback(() => setSmsState(s => ({ ...s, current: Math.max(0, s.frames.length - 1) })), [setSmsState])

  const clearSelectionClasses = useCallback(() => {
    const frameEl = displayRef.current?.querySelector('.frame.show') || null
    frameEl?.querySelectorAll('pre.active').forEach(el => { el.classList.remove('active'); el.removeAttribute('aria-current') })
    const listRoot = document.querySelector('.wrapper_frame_list .frame_list') || document.querySelector('.frame_list')
    const groupEl = listRoot?.querySelector('.frame_group.show') || null
    groupEl?.querySelectorAll('li.edit').forEach(el => { el.classList.remove('edit'); el.removeAttribute('aria-current') })
  }, [])

  const getSelectedItemIndices = useCallback(() => {
    const frameEl = displayRef.current?.querySelector('.frame.show') || null
    const listRoot = document.querySelector('.wrapper_frame_list .frame_list') || document.querySelector('.frame_list')
    const groupEl = listRoot?.querySelector('.frame_group.show') || null

    const preAll = frameEl ? Array.from(frameEl.querySelectorAll('pre')) : []
    const preActive = frameEl ? Array.from(frameEl.querySelectorAll('pre.active')) : []
    const preActiveIdx = preActive.map(el => preAll.indexOf(el)).filter(i => i >= 0)

    const liAll = groupEl ? Array.from(groupEl.querySelectorAll('li')) : []
    const liEdit = groupEl ? Array.from(groupEl.querySelectorAll('li.edit')) : []
    const liEditIdx = liEdit.map(el => liAll.indexOf(el)).filter(i => i >= 0)

    const intersection = preActiveIdx.filter(i => liEditIdx.includes(i))
    return Array.from(new Set(intersection)).sort((a, b) => a - b)
  }, [])

  const ALIGN_IDS = useMemo(() => new Set(['align', 'align-center', 'center']), [])

  const handlePreAction = useCallback((id) => {
    if (!(id === 'new' || id === 'clone' || id === 'delete' || ALIGN_IDS.has(id))) return

    setSmsState(s => {
      const fi = s.current
      const frames = s.frames.map((arr, i) => (i === fi ? [...arr] : arr))
      const items = frames[fi] || []

      if (id === 'new') items.push({ ...NEW_SMS_ITEM })

      if (id === 'clone' && items.length) {
        const selected = getSelectedItemIndices()
        if (selected.length) {
          const clones = selected.map(i => ({ ...items[i] }))
          const insertAfter = selected[selected.length - 1]
          items.splice(insertAfter + 1, 0, ...clones)
        } else {
          items.splice(items.length, 0, { ...items[items.length - 1] })
        }
      }

      if (id === 'delete' && items.length) {
        const selected = getSelectedItemIndices()
        if (selected.length) selected.slice().sort((a, b) => b - a).forEach(i => items.splice(i, 1))
        if (items.length === 0) items.push({ ...NEW_SMS_ITEM })
        requestAnimationFrame(clearSelectionClasses)
      }

      if (ALIGN_IDS.has(id) && items.length) {
        const selected = getSelectedItemIndices()
        if (!selected.length) return s
        const nextItems = [...items]
        selected.forEach(i => {
          if (i >= 0 && i < nextItems.length) nextItems[i] = { ...nextItems[i], center: !nextItems[i].center }
        })
        frames[fi] = nextItems
        return { ...s, frames }
      }

      frames[fi] = items
      return { ...s, frames }
    })
  }, [setSmsState, getSelectedItemIndices, clearSelectionClasses, ALIGN_IDS])

  const handleSmsAction = useCallback((id) => {
    if (id === 'save') { saveSmsNow(); return }
    if (id === 'code') { setIsCodeOpen(true); return }
    if (id === 'new') {
      setSmsState(s => {
        const frames = [...s.frames, [{ ...NEW_SMS_ITEM }]]
        return { ...s, frames, current: frames.length - 1 }
      }); return
    }
    if (id === 'clone') {
      setSmsState(s => {
        const cloned = JSON.parse(JSON.stringify(s.frames[s.current] ?? []))
        const frames = [...s.frames]
        frames.splice(s.current + 1, 0, cloned)
        return { ...s, frames, current: s.current + 1 }
      }); return
    }
    if (id === 'delete') {
      setSmsState(s => {
        const frames = s.frames.filter((_, i) => i !== s.current)
        const safe = frames.length ? frames : [[{ ...NEW_SMS_ITEM }]]
        const current = Math.max(0, Math.min(s.current, safe.length - 1))
        return { ...s, frames: safe, current }
      }); return
    }
    if (id === 'up') {
      setSmsState(s => {
        if (s.current <= 0) return s
        const frames = [...s.frames]
        ;[frames[s.current - 1], frames[s.current]] = [frames[s.current], frames[s.current - 1]]
        return { ...s, frames, current: s.current - 1 }
      }); return
    }
    if (id === 'down') {
      setSmsState(s => {
        if (s.current >= s.frames.length - 1) return s
        const frames = [...s.frames]
        ;[frames[s.current + 1], frames[s.current]] = [frames[s.current], frames[s.current + 1]]
        return { ...s, frames, current: s.current + 1 }
      }); return
    }
  }, [saveSmsNow, setSmsState])

  const location = useLocation()
  const isVorlagen  = location.pathname.startsWith('/vorlagen')
  const isSms       = location.pathname.startsWith('/sms_textbild')

  useEffect(() => { window.__dbgSmsFrames = smsState.frames }, [smsState.frames])

  return (
    <>
      <DisplayWrapper>
        {isSms ? (
          <WorkspaceSmsTextbild
            ref={displayRef}
            rows={GRID_SMS.rows}
            cols={GRID_SMS.cols}
            frames={smsState.frames}
            current={smsState.current}
            onPrev={goPrev}
            onNext={goNext}
            onRestart={goRestart}
            onStop={goStop}
          />
        ) : (<Display />)}
      </DisplayWrapper>

      <div className="wrapper wrapper_optionen_frame">
        <div className="container optionen_frame">
          <OptionenFrameSmsTextbild onAction={handleSmsAction} />
        </div>
      </div>

      <div className="wrapper wrapper_optionen_pre" style={{ '--bg-optionen-pre': routeStyle.color }}>
        <div className="container optionen_pre">
          <OptionenPre variant="sms" includePanel={false} onAction={handlePreAction} />
        </div>
      </div>

      <div className="wrapper wrapper_auswahl"><div className="container auswahl"><Auswahl /></div></div>

      <div className="wrapper wrapper_frame_list" style={{ '--bg-frame-list': routeStyle.color }}>
        <div className="container frame_list">
          <FrameListSmsTextbild
            frames={smsState.frames}
            current={smsState.current}
            onSelect={(idx) => setSmsState(s => ({ ...s, current: idx }))}
          />
        </div>
      </div>

      <div className="wrapper wrapper_quellcode">
        <div className="container quellcode-wrap">
          <Quellcode isOpen={isSms && isCodeOpen} onClose={() => setIsCodeOpen(false)} variant="sms" />
        </div>
      </div>

      <div className="wrapper wrapper_footer" style={{ '--bg-footer': routeStyle.color }}>
        <div className="container footer"><Footer /></div>
      </div>
    </>
  )
}

function Textbild2EditorApp({ tb2State, setTb2State, saveTb2Now, routeStyle }) {
  const { setTotal, setCurrent } = useFrameNav()
  const displayRef = useRef(null)
  const [isCodeOpen, setIsCodeOpen] = useState(false)

  useEffect(() => { setTotal?.(tb2State.frames.length) }, [tb2State.frames.length, setTotal])
  useEffect(() => { setCurrent?.(tb2State.current) }, [tb2State.current, setCurrent])

  const goPrev = useCallback(() => setTb2State(s => ({ ...s, current: Math.max(0, s.current - 1) })), [setTb2State])
  const goNext = useCallback(() => setTb2State(s => ({ ...s, current: Math.min(s.frames.length - 1, s.current + 1) })), [setTb2State])
  const goRestart = useCallback(() => setTb2State(s => ({ ...s, current: 0 })), [setTb2State])
  const goStop = useCallback(() => setTb2State(s => ({ ...s, current: Math.max(0, s.frames.length - 1) })), [setTb2State])

  const ALIGN_IDS = useMemo(() => new Set(['align','align-center','center']), [])
  const MOVE_DELTAS = useMemo(() => ({
    left:  { dx: -1, dy:  0 },
    right: { dx:  1, dy:  0 },
    up:    { dx:  0, dy: -1 },
    down:  { dx:  0, dy:  1 },
  }), [])

  const getSelectedItemIndices = useCallback(() => {
    const frameEl = displayRef.current?.querySelector('.frame.show') || null
    const listRoot = document.querySelector('.wrapper_frame_list .frame_list') || document.querySelector('.frame_list')
    const groupEl = listRoot?.querySelector('.frame_group.show') || null
    if (!frameEl || !groupEl) return []
    const preAll = Array.from(frameEl.querySelectorAll('pre'))
    const preActiveIdx = Array.from(frameEl.querySelectorAll('pre.active')).map(el => preAll.indexOf(el)).filter(i => i >= 0)
    const liAll = Array.from(groupEl.querySelectorAll('li'))
    const liEditIdx = Array.from(groupEl.querySelectorAll('li.edit')).map(li => liAll.indexOf(li)).filter(i => i >= 0)
    return Array.from(new Set(preActiveIdx.filter(i => liEditIdx.includes(i)))).sort((a,b) => a - b)
  }, [])

  const clearSelectionClasses = useCallback(() => {
    const frameEl = displayRef.current?.querySelector('.frame.show') || null
    frameEl?.querySelectorAll('pre.active').forEach(el => { el.classList.remove('active'); el.removeAttribute('aria-current') })
    const listRoot = document.querySelector('.wrapper_frame_list .frame_list') || document.querySelector('.frame_list')
    const groupEl = listRoot?.querySelector('.frame_group.show') || null
    groupEl?.querySelectorAll('li.edit').forEach(li => { li.classList.remove('edit'); li.removeAttribute('aria-current') })
  }, [])

  const handleFrameAction = useCallback((id) => {
    if (id === 'save') { saveTb2Now(); return }
    if (id === 'code') { setIsCodeOpen(true); return }
    if (id === 'new') {
      setTb2State(s => {
        const frames = [...s.frames, [{ ...NEW_TB2_ITEM }]]
        return { ...s, frames, current: frames.length - 1 }
      }); return
    }
    if (id === 'clone') {
      setTb2State(s => {
        const cloned = JSON.parse(JSON.stringify(s.frames[s.current] ?? []))
        const frames = [...s.frames]
        frames.splice(s.current + 1, 0, cloned)
        return { ...s, frames, current: s.current + 1 }
      }); return
    }
    if (id === 'delete') {
      setTb2State(s => {
        const frames = s.frames.filter((_, i) => i !== s.current)
        const safe = frames.length ? frames : [[{ ...NEW_TB2_ITEM }]]
        const current = Math.max(0, Math.min(s.current, safe.length - 1))
        return { ...s, frames: safe, current }
      }); return
    }
    if (id === 'up') {
      setTb2State(s => {
        if (s.current <= 0) return s
        const frames = [...s.frames]
        ;[frames[s.current - 1], frames[s.current]] = [frames[s.current], frames[s.current - 1]]
        return { ...s, frames, current: s.current - 1 }
      }); return
    }
    if (id === 'down') {
      setTb2State(s => {
        if (s.current >= s.frames.length - 1) return s
        const frames = [...s.frames]
        ;[frames[s.current + 1], frames[s.current]] = [frames[s.current], frames[s.current + 1]]
        return { ...s, frames, current: s.current + 1 }
      }); return
    }
  }, [saveTb2Now, setTb2State])

  const handlePreAction = useCallback((id, payload) => {
    if (!['new','clone','delete','left','right','up','down','align','align-center','center','ascii'].includes(id)) return

    setTb2State(s => {
      const fi = s.current
      const frames = s.frames.map((arr, i) => (i === fi ? arr.map(it => ({ ...it })) : arr))
      const items = frames[fi] || []

      if (id === 'new') {
        items.push({ ...NEW_TB2_ITEM, text: '' })
        frames[fi] = items
        return { ...s, frames }
      }

      if (id === 'clone' && items.length) {
        const selected = getSelectedItemIndices()
        if (selected.length) {
          const clones = selected.map(i => ({ ...items[i] }))
          const insertAfter = selected[selected.length - 1]
          items.splice(insertAfter + 1, 0, ...clones)
        } else {
          items.push({ ...items[items.length - 1] })
        }
        frames[fi] = items
        return { ...s, frames }
      }

      if (id === 'delete' && items.length) {
        const selected = getSelectedItemIndices()
        if (selected.length) selected.slice().sort((a,b) => b - a).forEach(i => items.splice(i,1))
        if (!items.length) items.push({ ...NEW_TB2_ITEM, text: '' })
        frames[fi] = items
        requestAnimationFrame(clearSelectionClasses)
        return { ...s, frames }
      }

      if (new Set(['align','align-center','center']).has(id)) {
        const indices = payload?.indices ?? getSelectedItemIndices()
        if (!indices.length) return s
        indices.forEach(i => { if (i >= 0 && i < items.length) items[i].center = !items[i].center })
        frames[fi] = items
        return { ...s, frames }
      }

      if (id === 'ascii') {
        const indices = payload?.indices ?? getSelectedItemIndices()
        if (!indices.length) return s
        indices.forEach(i => {
          if (i < 0 || i >= items.length) return
          const cls = Array.isArray(items[i].classes) ? items[i].classes.slice() : ['zeilen4']
          items[i].classes = cls.includes('ascii') ? cls.filter(c => c !== 'ascii') : [...cls, 'ascii']
        })
        frames[fi] = items
        return { ...s, frames }
      }

      if (id in MOVE_DELTAS) {
        const { dx, dy } = MOVE_DELTAS[id]
        const indices = getSelectedItemIndices()
        if (!indices.length) return s
        indices.forEach(i => {
          if (i >= 0 && i < items.length) {
            const it = items[i]
            const nx = Math.max(1, Math.min(GRID_TB2.cols, (it.col ?? 1) + dx))
            const ny = Math.max(1, Math.min(GRID_TB2.rows, (it.row ?? 1) + dy))
            it.col = nx
            it.row = ny
          }
        })
        frames[fi] = items
        return { ...s, frames }
      }

      return s
    })
  }, [setTb2State, getSelectedItemIndices, clearSelectionClasses])

  return (
    <>
      <DisplayWrapper>
        <WorkspaceTextbild2
          ref={displayRef}
          rows={GRID_TB2.rows}
          cols={GRID_TB2.cols}
          frames={tb2State.frames}
          current={tb2State.current}
          onPrev={goPrev}
          onNext={goNext}
          onRestart={goRestart}
          onStop={goStop}
        />
      </DisplayWrapper>

      <div className="wrapper wrapper_optionen_frame">
        <div className="container optionen_frame">
          <OptionenFrameTextbild2 onAction={handleFrameAction} />
        </div>
      </div>

      <div className="wrapper wrapper_optionen_pre" style={{ '--bg-optionen-pre': routeStyle.color }}>
        <div className="container optionen_pre">
          <OptionenPre variant="textbild2" includePanel={false} onAction={handlePreAction} />
        </div>
      </div>

      <div className="wrapper wrapper_auswahl"><div className="container auswahl"><Auswahl /></div></div>

      <div className="wrapper wrapper_frame_list" style={{ '--bg-frame-list': routeStyle.color }}>
        <div className="container frame_list">
          <FrameListTextbild2
            frames={tb2State.frames}
            current={tb2State.current}
            onSelect={(idx) => setTb2State(s => ({ ...s, current: idx }))}
          />
        </div>
      </div>

      <div className="wrapper wrapper_quellcode">
        <div className="container quellcode-wrap">
          <QuellcodeTextbild2 isOpen={isCodeOpen} onClose={() => setIsCodeOpen(false)} />
        </div>
      </div>

      <div className="wrapper wrapper_footer" style={{ '--bg-footer': routeStyle.color }}>
        <div className="container footer"><Footer /></div>
      </div>
    </>
  )
}

export default function App() {
  const location = useLocation()
  const routeStyle = useMemo(() => pickStyle(location.pathname), [location.pathname])

  useEffect(() => {
    const clsList = document.body.classList
    Array.from(clsList).filter(c => c.startsWith('page-')).forEach(c => clsList.remove(c))
    clsList.add(routeStyle.body)
  }, [routeStyle.body])

  const isSms       = location.pathname.startsWith('/sms_textbild')
  const isTextbild2 = location.pathname.startsWith('/textbild2')
  const isVorlagen  = location.pathname.startsWith('/vorlagen')

  const { state: smsState, setState: setSmsState, saveNow: saveSmsNow } = usePersistentEditor(
    'editor:sms_textbild',
    { frames: [[{ ...NEW_SMS_ITEM }]], current: 0 },
    { version: 2, normalize: normalizeSmsState }
  )
  const { state: tb2State, setState: setTb2State, saveNow: saveTb2Now } = usePersistentEditor(
    'editor:textbild2',
    { frames: [[{ ...NEW_TB2_ITEM }]], current: 0 },
    { version: 4, normalize: normalizeTb2State }
  )

  const active = isTextbild2 ? tb2State : smsState

  return (
    <UiToggleProvider>
      <FrameNavProvider
        initial={0}
        initialTotal={active.frames.length}
        readItemText={(fi, ii) => active.frames?.[fi]?.[ii]?.text ?? ''}
        writeItemText={(fi, ii, text) => {
          const writeActive = isTextbild2 ? setTb2State : setSmsState
          writeActive(s => {
            if (!s.frames?.[fi]?.[ii]) return s
            const frames = s.frames.map((arr, idx) => (idx === fi ? [...arr] : arr))
            frames[fi][ii] = { ...frames[fi][ii], text }
            return { ...s, frames }
          })
        }}
        readItemClasses={(fi, ii) => active.frames?.[fi]?.[ii]?.classes ?? []}
        writeItemClasses={(fi, ii, classes) => {
          const writeActive = isTextbild2 ? setTb2State : setSmsState
          writeActive(s => {
            if (!s.frames?.[fi]?.[ii]) return s
            const frames = s.frames.map((arr, idx) => (idx === fi ? [...arr] : arr))
            frames[fi][ii] = { ...frames[fi][ii], classes: normClasses(classes) }
            return { ...s, frames }
          })
        }}
      >
        <div className="index">
          <div className="wrapper wrapper_nav"><div className="container nav"><Nav /></div></div>

          {isTextbild2 ? (
            <Textbild2EditorApp
              tb2State={tb2State}
              setTb2State={setTb2State}
              saveTb2Now={saveTb2Now}
              routeStyle={routeStyle}
            />
          ) : isSms ? (
            <SmsEditorApp
              smsState={smsState}
              setSmsState={setSmsState}
              saveSmsNow={saveSmsNow}
              routeStyle={routeStyle}
            />
          ) : isVorlagen ? (
            <>
              <DisplayWrapper>
                <VorlagenPage />
              </DisplayWrapper>

              <div className="wrapper wrapper_footer" style={{ '--bg-footer': routeStyle.color }}>
                <div className="container footer"><Footer /></div>
              </div>
            </>
          ) : (
            <DisplayWrapper>
              <Display />
            </DisplayWrapper>
          )}
        </div>
      </FrameNavProvider>
    </UiToggleProvider>
  )
}
