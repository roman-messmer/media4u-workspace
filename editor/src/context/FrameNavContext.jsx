import React, { createContext, useContext, useMemo, useCallback, useReducer } from 'react'

const Ctx = createContext(null)
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export const SIZE_CLASSES = ['zeilen1','zeilen2', 'zeilen4', 'zeilen8', 'zeilen16']

export const COLOR_CLASSES = [
  'Black','DimGray','Gray','DarkGray','Silver','LightGrey','WhiteSmoke','White',
  'DarkRed','FireBrick','Crimson','Red','IndianRed','LightCoral','Salmon','DarkSalmon',
  'HotPink','DeepPink','MediumVioletRed','PaleVioletRed','LightPink','Pink','Thistle',
  'Plum','Violet','Orchid','Magenta','Fuchsia','MediumOrchid','DarkOrchid','DarkViolet',
  'Purple','MediumPurple','RebeccaPurple','BlueViolet','Indigo','DarkSlateBlue','SlateBlue',
  'MediumSlateBlue','DarkBlue','MediumBlue','Blue','RoyalBlue','SteelBlue','DodgerBlue',
  'DeepSkyBlue','CornflowerBlue','SkyBlue','LightSkyBlue','LightBlue','PowderBlue',
  'Aqua','Cyan','PaleTurquoise','Aquamarine','Turquoise','MediumTurquoise','DarkTurquoise',
  'LightSeaGreen','CadetBlue','DarkCyan','Teal','DarkGreen','Green','ForestGreen','SeaGreen',
  'MediumSeaGreen','SpringGreen','MediumSpringGreen','LightGreen','PaleGreen','DarkSeaGreen',
  'MediumAquamarine','YellowGreen','LawnGreen','Chartreuse','LimeGreen','Lime','GreenYellow',
  'OliveDrab','Olive','DarkOliveGreen','DarkKhaki','Khaki','Yellow','Gold',
  'LightGoldenrodYellow','LemonChiffon','LightYellow','Orange','DarkOrange','Coral',
  'LightSalmon','SandyBrown','Chocolate','Sienna','Brown','Maroon','Beige','AntiqueWhite',
  'BurlyWood','Wheat','Tan','RosyBrown','Moccasin','NavajoWhite','PeachPuff','MistyRose',
  'LavenderBlush','Linen','OldLace','PapayaWhip','SeaShell','MintCream','Azure','AliceBlue','GhostWhite'
]

export const COLOR_CLASS_MAP = Object.fromEntries(
  COLOR_CLASSES.map(c => [c.toLowerCase(), c])
)

export const isRotateClass = (c) =>
  /^drehen_\d+$/.test(c) || /^spiegeln_drehen_\d+$/.test(c)

export const makeRotateClass = (deg = 0, flip = false) => {
  const fixed = ((deg % 360) + 360) % 360
  const snap = Math.round(fixed / 5) * 5
  const d = snap === 360 ? 0 : snap
  return flip ? `spiegeln_drehen_${d}` : `drehen_${d}`
}

function stripSize(arr = [])  { return arr.filter(c => !SIZE_CLASSES.includes(c)) }
function stripColor(arr = []) { return arr.filter(c => !COLOR_CLASSES.includes(c)) }
function stripRotate(arr = []){ return arr.filter(c => !isRotateClass(c)) }

function normalizeClasses(input, fallbackSize = 'zeilen4') {
  const arr = Array.isArray(input) ? input.slice() : []
  const afterSize = stripSize(arr)
  const size = arr.find(c => SIZE_CLASSES.includes(c)) || fallbackSize
  return Array.from(new Set([size, ...afterSize]))
}

const initialState = { total: 1, current: 0, activeByFrame: new Map(), stamp: 0 }
const A = { SET_TOTAL:'SET_TOTAL', SET_CURRENT:'SET_CURRENT', SET_ACTIVE_SINGLE:'SET_ACTIVE_SINGLE', TOGGLE_ITEM:'TOGGLE_ITEM', CLEAR_FRAME_SELECTION:'CLEAR_FRAME_SELECTION' }

function reducer(state, action) {
  switch (action.type) {
    case A.SET_TOTAL: {
      const total = Math.max(1, action.total | 0)
      const current = clamp(state.current, 0, total - 1)
      const activeByFrame = new Map(state.activeByFrame)
      for (const k of [...activeByFrame.keys()]) if (k >= total) activeByFrame.delete(k)
      return { ...state, total, current, activeByFrame }
    }
    case A.SET_CURRENT: {
      const next = clamp(action.current | 0, 0, Math.max(0, state.total - 1))
      if (next === state.current) return state
      return { ...state, current: next, stamp: state.stamp + 1 }
    }
    case A.SET_ACTIVE_SINGLE: {
      const { frameIndex, itemIndex } = action
      if (frameIndex < 0 || frameIndex >= state.total) return state
      const activeByFrame = new Map(state.activeByFrame)
      const existing = new Set(activeByFrame.get(frameIndex) ?? [])
      if (existing.size === 1 && existing.has(itemIndex)) activeByFrame.set(frameIndex, new Set())
      else activeByFrame.set(frameIndex, new Set([itemIndex]))
      return { ...state, activeByFrame, stamp: state.stamp + 1 }
    }
    case A.TOGGLE_ITEM: {
      const { frameIndex, itemIndex } = action
      if (frameIndex < 0 || frameIndex >= state.total) return state
      const activeByFrame = new Map(state.activeByFrame)
      const set = new Set(activeByFrame.get(frameIndex) ?? [])
      set.has(itemIndex) ? set.delete(itemIndex) : set.add(itemIndex)
      activeByFrame.set(frameIndex, set)
      return { ...state, activeByFrame, stamp: state.stamp + 1 }
    }
    case A.CLEAR_FRAME_SELECTION: {
      const { frameIndex } = action
      const activeByFrame = new Map(state.activeByFrame)
      activeByFrame.set(frameIndex, new Set())
      return { ...state, activeByFrame, stamp: state.stamp + 1 }
    }
    default: return state
  }
}

export function FrameNavProvider({
  children,
  initial = 0,
  initialTotal = 1,
  readItemText, writeItemText,
  readItemClasses, writeItemClasses,
}) {
  const seeded = useMemo(() => {
    const total = Math.max(1, initialTotal | 0)
    const current = clamp(initial | 0, 0, Math.max(0, total - 1))
    return { ...initialState, total, current }
  }, [initial, initialTotal])

  const [state, dispatch] = useReducer(reducer, seeded)

  const setTotal   = useCallback((t) => dispatch({ type: A.SET_TOTAL, total: t }), [])
  const setCurrent = useCallback((i) => dispatch({ type: A.SET_CURRENT, current: i }), [])
  const setActive  = useCallback((fi, ii) => dispatch({ type: A.SET_ACTIVE_SINGLE, frameIndex: fi, itemIndex: ii }), [])
  const toggleItem = useCallback((fi, ii) => dispatch({ type: A.TOGGLE_ITEM, frameIndex: fi, itemIndex: ii }), [])
  const clearSelection = useCallback((fi) => dispatch({ type: A.CLEAR_FRAME_SELECTION, frameIndex: fi }), [])

  const isItemActive = useCallback((fi, ii) => {
    const set = state.activeByFrame.get(fi)
    return set ? set.has(ii) : false
  }, [state.activeByFrame])

  const getPrimaryActiveIndex = useCallback((fi = state.current) => {
    const set = state.activeByFrame.get(fi)
    if (!set || set.size === 0) return null
    return Math.min(...set)
  }, [state.activeByFrame, state.current])

  const getItemText = useCallback((fi, ii, fallback = '') => {
    return typeof readItemText === 'function' ? (readItemText(fi, ii) ?? fallback) : fallback
  }, [readItemText])

  const getPrimaryActiveText = useCallback(() => {
    const fi = state.current
    const ii = getPrimaryActiveIndex(fi)
    if (ii == null) return ''
    return getItemText(fi, ii, '')
  }, [state.current, getPrimaryActiveIndex, getItemText])

  const setTextForActiveItems = useCallback((text) => {
    if (typeof writeItemText !== 'function') return
    const fi = state.current
    const set = state.activeByFrame.get(fi)
    if (!set || set.size === 0) return
    for (const ii of set) writeItemText(fi, ii, text)
  }, [state.current, state.activeByFrame, writeItemText])

  const normalizeClasses = useCallback((input) => {
    const arr = Array.isArray(input) ? input.slice() : []
    const afterSize = arr.filter(c => !SIZE_CLASSES.includes(c))
    const size = arr.find(c => SIZE_CLASSES.includes(c)) || 'zeilen4'
    return Array.from(new Set([size, ...afterSize]))
  }, [])

  const updateClassesForActiveItems = useCallback((updater) => {
    const fi = state.current
    const set = state.activeByFrame.get(fi)
    if (!set || set.size === 0) return
    if (typeof writeItemClasses !== 'function') return
    for (const ii of set) {
      const existing = typeof readItemClasses === 'function' ? readItemClasses(fi, ii) : []
      const nextFromUpdater = updater(Array.isArray(existing) ? existing : [])
      const normalized = normalizeClasses(nextFromUpdater)
      writeItemClasses(fi, ii, normalized)
    }
  }, [state.current, state.activeByFrame, readItemClasses, writeItemClasses, normalizeClasses])

  const setColorForActiveItems = useCallback((colorClassName) => {
    if (!colorClassName || !COLOR_CLASSES.includes(colorClassName)) return
    updateClassesForActiveItems(prev => {
      const withoutColors = prev.filter(c => !COLOR_CLASSES.includes(c))
      return Array.from(new Set([...withoutColors, colorClassName]))
    })
  }, [updateClassesForActiveItems])

  const setRotateForActiveItems = useCallback(({ deg = 0, flip = false }) => {
    const className = makeRotateClass(deg, flip)
    updateClassesForActiveItems(prev => {
      const withoutRot = prev.filter(c => !isRotateClass(c))
      return Array.from(new Set([...withoutRot, className]))
    })
  }, [updateClassesForActiveItems])

  const value = useMemo(() => ({
    total: state.total,
    current: state.current,
    last: Math.max(0, state.total - 1),

    setTotal, setCurrent, setActive, toggleItem, clearSelection,
    isItemActive, getPrimaryActiveIndex,
    getItemText, getPrimaryActiveText, setTextForActiveItems,

    updateClassesForActiveItems,
    setColorForActiveItems,
    setRotateForActiveItems,

    activeStamp: state.stamp,

    goBack:  () => setCurrent(state.current - 1),
    goNext:  () => setCurrent(state.current + 1),
    goStart: () => setCurrent(0),
    goEnd:   () => setCurrent(Math.max(0, state.total - 1)),
  }), [
    state.total, state.current, state.stamp,
    setTotal, setCurrent, setActive, toggleItem, clearSelection,
    isItemActive, getPrimaryActiveIndex, getItemText, getPrimaryActiveText,
    setTextForActiveItems, updateClassesForActiveItems,
    setColorForActiveItems, setRotateForActiveItems
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFrameNav() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFrameNav must be used inside <FrameNavProvider>')
  return ctx
}
