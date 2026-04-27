import { useEffect, useMemo, useRef, useState } from 'react'

export function usePersistentEditor(key, initialState, options = {}) {
  const { version = 1, normalize } = options

  const initialValue = useMemo(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return typeof normalize === 'function' ? normalize(initialState) : initialState
      const parsed = JSON.parse(raw)
      const data = parsed?.data
      const sameVersion = parsed?._v === version
      const base = sameVersion && data != null ? data : (data ?? initialState)
      return typeof normalize === 'function' ? normalize(base) : base
    } catch {
      return typeof normalize === 'function' ? normalize(initialState) : initialState
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const [state, setState] = useState(initialValue)
  const debounceRef = useRef(0)

  const writeNow = (value) => {
    try {
      const toWrite = typeof normalize === 'function' ? normalize(value) : value
      localStorage.setItem(key, JSON.stringify({ _v: version, ts: Date.now(), data: toWrite }))
      return true
    } catch { return false }
  }

  const setAndSave = (updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      writeNow(next)
      return next
    })
  }

  useEffect(() => {
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ _v: version, ts: Date.now(), data: state }))
      } catch {}
    }, 350)
    return () => window.clearTimeout(debounceRef.current)
  }, [key, state, version])

  useEffect(() => {
    const onBeforeUnload = () => { try { writeNow(state) } catch {} }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [state])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null
        const incoming = parsed?.data
        if (incoming == null) return
        const next = typeof normalize === 'function' ? normalize(incoming) : incoming
        setState(next)
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, normalize])

  const saveNow = () => writeNow(state)
  const clearAll = () => { try { localStorage.removeItem(key) } catch {} }

  return { state, setState, setAndSave, saveNow, clearAll }
}
