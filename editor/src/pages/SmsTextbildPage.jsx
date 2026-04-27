import React, { useRef, useState, useCallback, useEffect } from 'react'
import DisplaySmsTextbild from '../components/display/DisplaySmsTextbild'
import OptionenFrameSmsTextbild from '../components/optionen_frame/OptionenFrameSmsTextbild'
import OptionenPreSmsTextbild from '../components/optionen_pre/OptionenPreSmsTextbild'
import Quellcode from '../components/quellcode/Quellcode'
import { usePersistentEditor } from '../utils/usePersistentEditor'
import { normalizeFrames } from '../utils/normalizeFrames'

const STORAGE_KEY = 'sms_frames'
const STORAGE_VERSION = 4

const DEFAULT_FRAMES = normalizeFrames([
  [{ text: 'Hallo 🌍', col: 2, row: 2, center: false }],
  [{ text: 'Willkommen bei MEDIA4U', col: 2, row: 3, center: false }]
])

export default function SmsTextbildPage() {
  const displayRef = useRef(null)

  // Achtung: viele Custom-Hooks akzeptieren KEINE Updater-Funktion.
  // Wir benutzen deshalb weiter unten "value set" (nicht prev => ...).
  const { state: frames, setAndSave: setFrames, saveNow } = usePersistentEditor(
    STORAGE_KEY,
    DEFAULT_FRAMES,
    { version: STORAGE_VERSION, normalize: normalizeFrames }
  )

  const [current, setCurrent] = useState(0)
  const [isCodeOpen, setIsCodeOpen] = useState(false)

  useEffect(() => { window.__dbgFrames = frames }, [frames])
  useEffect(() => {
    setCurrent(c => Math.min(Math.max(0, c), Math.max(0, frames.length - 1)))
  }, [frames.length])

  const NEW_ITEM = { text: '#', col: 2, row: 2, center: false }

  // --- helpers ----------------------------------------------------

  const nextWith = useCallback((mutator) => {
    // Erzeuge eine neue tiefe Kopie auf Ebenen Frame-Array + Items
    const next = frames.map(items => items.map(it => ({ ...it })))
    mutator(next)
    setFrames(next) // value-set, kein Updater!
  }, [frames, setFrames])

  // --- actions ----------------------------------------------------

  const handleNew = useCallback(() => {
    nextWith(next => {
      if (!next[current]) next[current] = []
      next[current].push({ ...NEW_ITEM })
    })
  }, [current, nextWith])

  const handleAlignToggle = useCallback(({ indices = [] } = {}) => {
    nextWith(next => {
      const items = next[current] || []
      indices.forEach(i => {
        if (i >= 0 && i < items.length) items[i].center = !items[i].center
      })
    })
  }, [current, nextWith])

  // Legacy: falls "align" mit payload.changes kommt
  const handleAlignLegacy = useCallback((payload) => {
    nextWith(next => {
      const items = next[current] || []
      for (const ch of payload?.changes || []) {
        if (Number.isInteger(ch.index) && ch.index >= 0 && ch.index < items.length) {
          items[ch.index].center = Boolean(ch.center)
        }
      }
    })
  }, [current, nextWith])

  const handleCode = useCallback(() => setIsCodeOpen(true), [])
  const handlePrev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const handleNext = useCallback(() => setCurrent(c => Math.min(frames.length - 1, c + 1)), [frames.length])
  const handleRestart = useCallback(() => setCurrent(0), [])
  const handleStop = useCallback(() => {}, [])
  const handleClone  = useCallback(() => {}, [])
  const handleUp     = useCallback(() => {}, [])
  const handleDown   = useCallback(() => {}, [])
  const handleSave   = useCallback(() => { saveNow() }, [saveNow])
  const handleDelete = useCallback(() => {}, [])

  const handleAction = useCallback((id, payload) => {
    // console.log('[SmsTextbildPage] action:', id, payload)
    const map = {
      new: handleNew,
      clone: handleClone,
      up: handleUp,
      down: handleDown,
      save: handleSave,
      delete: handleDelete,
      code: handleCode,
      prev: handlePrev,
      next: handleNext,
      restart: handleRestart,
      stop: handleStop,
      close: () => setIsCodeOpen(false),
      alignToggle: () => handleAlignToggle(payload),
      align:      () => handleAlignLegacy(payload)
    }
    if (!map[id]) {
      console.warn('[SmsTextbildPage] Unbekannte Aktion:', id, payload)
      return
    }
    map[id]?.()
  }, [handleNew, handleClone, handleUp, handleDown, handleSave, handleDelete, handleCode, handlePrev, handleNext, handleRestart, handleStop, handleAlignToggle, handleAlignLegacy])

  // --- debug helper in console -----------------------------------

  useEffect(() => {
    window.__dbgToggleFirst = () => handleAlignToggle({ indices: [0] })
  }, [handleAlignToggle])

  // --- render -----------------------------------------------------

  return (
    <main className="sms_page" data-testid="sms-page">
      <DisplaySmsTextbild
        ref={displayRef}
        rows={32}
        cols={64}
        frames={frames}
        current={current}
        onPrev={() => handleAction('prev')}
        onNext={() => handleAction('next')}
        onRestart={() => handleAction('restart')}
        onStop={() => handleAction('stop')}
      />

      <OptionenPreSmsTextbild onAction={handleAction} />
      <OptionenFrameSmsTextbild onAction={handleAction} />

      <Quellcode
        isOpen={isCodeOpen}
        onClose={() => handleAction('close')}
        variant="sms"
        displayRef={displayRef}
      />
    </main>
  )
}
