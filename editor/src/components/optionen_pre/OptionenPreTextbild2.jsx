// src/components/optionen_pre/OptionenPreTextbild2.jsx
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import '../optionen_pre/OptionenPre.css'
import { useUiToggles } from '../../context/UiToggleContext'

import icFile from '../../assets/file-lines.svg'
import icClone from '../../assets/clone.svg'
import icTrash from '../../assets/trash-can.svg'
import icEraser from '../../assets/eraser.svg'
import icArrowLeft from '../../assets/arrow-left.svg'
import icArrowRight from '../../assets/arrow-right.svg'
import icArrowUp from '../../assets/arrow-up.svg'
import icArrowDown from '../../assets/arrow-down.svg'
import icFont from '../../assets/font.svg'
import icTextHeight from '../../assets/text-height.svg'
import icArrowsSpin from '../../assets/arrows-spin.svg'
import icAlignCenter from '../../assets/align-center.svg'
import icPalette from '../../assets/palette.svg'
import icChevronLeft from '../../assets/chevron-left.svg'
import icChevronRight from '../../assets/chevron-right.svg'
import icAscii from '../../assets/arrows-split-up-and-left.svg'

function ConfirmDialog({ open, title = 'Löschen bestätigen', message, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusables = () =>
      dialogRef.current?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || []

    const focusFirst = () => {
      const items = getFocusables()
      if (items.length) items[0].focus()
    }

    const onKeyDown = (e) => {
      if (!dialogRef.current?.contains(document.activeElement)) return
      if (e.key === 'Escape') { e.preventDefault(); onCancel?.() }
      else if (e.key === 'Enter') { e.preventDefault(); onConfirm?.() }
      else if (e.key === 'Tab') {
        const items = Array.from(getFocusables())
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    const t = setTimeout(focusFirst, 0)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      prevFocusRef.current?.focus?.()
    }
  }, [open, onCancel, onConfirm])

  if (!open) return null
  const onBackdropMouseDown = (e) => { if (e.target === e.currentTarget) onCancel?.() }

  return (
    <div className="confirm_backdrop" role="presentation" onMouseDown={onBackdropMouseDown}>
      <div
        className="confirm_modal"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <h2 id="confirm-title" className="confirm_title">{title}</h2>
        <p id="confirm-desc" className="confirm_message">{message}</p>
        <div className="confirm_actions_textbild2">
          <button type="button" className="btn yes" onClick={() => onConfirm?.()}>Ja</button>
          <button type="button" className="btn no" onClick={() => onCancel?.()}>Nein</button>
        </div>
      </div>
    </div>
  )
}

function InfoDialog({ open, title = 'Hinweis', message, onClose }) {
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusables = () =>
      dialogRef.current?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || []

    const focusFirst = () => {
      const items = getFocusables()
      if (items.length) items[0].focus()
    }

    const onKeyDown = (e) => {
      if (!dialogRef.current?.contains(document.activeElement)) return
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose?.() }
    }

    const t = setTimeout(focusFirst, 0)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      prevFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  const onBackdropMouseDown = (e) => { if (e.target === e.currentTarget) onClose?.() }

  return (
    <div className="confirm_backdrop" role="presentation" onMouseDown={onBackdropMouseDown}>
      <div
        className="confirm_modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
        aria-describedby="info-desc"
      >
        <h2 id="info-title" className="confirm_title">{title}</h2>
        <p id="info-desc" className="confirm_message">{message}</p>
        <div className="confirm_actions_textbild2">
          <button type="button" className="btn no" onClick={() => onClose?.()}>OK</button>
        </div>
      </div>
    </div>
  )
}

export default function OptionenPreTextbild2({ onAction }) {
  const listRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoText, setInfoText] = useState('')

  const {
    showZeichenTextbild2,   toggleZeichenTextbild2,
    showZeilenTextbild2,    toggleZeilenTextbild2,
    showSpiegelnTextbild2,  toggleSpiegelnTextbild2,
    showFarbenTextbild2,    toggleFarbenTextbild2,
  } = useUiToggles()

  const fontPanelId   = 'zeichen2-panel'
  const sizePanelId   = 'zeilen-panel'
  const rotatePanelId = 'spiegeln-panel'
  const colorPanelId  = 'farben-panel'

  const config = useMemo(() => ([
    { id: 'new',    label: 'Neues pre',         icon: icFile },
    { id: 'clone',  label: 'pre duplizieren',   icon: icClone },
    { id: 'font',   label: 'Schriftart',        icon: icFont },
    { id: 'size',   label: 'Textgröße',         icon: icTextHeight },
    { id: 'up',     label: 'Nach oben',         icon: icArrowUp },
    { id: 'down',   label: 'Nach unten',        icon: icArrowDown },
    { id: 'left',   label: 'Nach links',        icon: icArrowLeft },
    { id: 'right',  label: 'Nach rechts',       icon: icArrowRight },
    { id: 'align',  label: 'Zentrieren',        icon: icAlignCenter },
    { id: 'ascii',  label: 'ASCII',             icon: icAscii },
    { id: 'color',  label: 'Farben',            icon: icPalette },
    { id: 'rotate', label: 'Drehen',            icon: icArrowsSpin },
    { id: 'clear',  label: 'Leeren',            icon: icEraser },
    { id: 'delete', label: 'Löschen',           icon: icTrash },
  ]), [])

  const updateArrows = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 0)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = listRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateArrows) }
    const onResize = () => updateArrows()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [updateArrows])

  const scrollNav = (direction) => {
    const el = listRef.current
    if (!el) return
    const scrollAmount = 160
    const max = el.scrollWidth - el.clientWidth
    const cur = el.scrollLeft
    const next = direction === 'left' ? Math.max(0, cur - scrollAmount) : Math.min(max, cur + scrollAmount)
    el.scrollTo({ left: next, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const handleWheel = (e) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollBy({ left: e.deltaY })
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const hasSelection = useCallback(() => {
    const displayRoot = document.querySelector('figure.textbild2 .display')
    const activeFrame = displayRoot?.querySelector('.frame.show') || null
    const listRoot =
      document.querySelector('.wrapper_frame_list .frame_list') ||
      document.querySelector('.frame_list')
    const activeGroup = listRoot?.querySelector('.frame_group.show') || null
    const hasActive = !!activeFrame?.querySelector('pre.active')
    const hasEdit = !!activeGroup?.querySelector('li.edit')
    return hasActive || hasEdit
  }, [])

  // Schnittmenge aus pre.active im aktiven Frame und li.edit in der aktiven Gruppe
  const collectActiveIndices = useCallback(() => {
    const displayRoot = document.querySelector('figure.textbild2 .display')
    const activeFrame = displayRoot?.querySelector('.frame.show') || null
    const listRoot =
      document.querySelector('.wrapper_frame_list .frame_list') ||
      document.querySelector('.frame_list')
    const activeGroup = listRoot?.querySelector('.frame_group.show') || null
    if (!activeFrame || !activeGroup) return []
    const preAll = Array.from(activeFrame.querySelectorAll('pre'))
    const preActiveIdx = Array.from(activeFrame.querySelectorAll('pre.active'))
      .map(el => preAll.indexOf(el)).filter(i => i >= 0)
    const liAll = Array.from(activeGroup.querySelectorAll('li'))
    const liEditIdx = Array.from(activeGroup.querySelectorAll('li.edit'))
      .map(li => liAll.indexOf(li)).filter(i => i >= 0)
    return Array.from(new Set(preActiveIdx.filter(i => liEditIdx.includes(i)))).sort((a, b) => a - b)
  }, [])

  const infoNoSelection = useCallback((text = 'Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren.') => {
    setInfoText(text)
    setInfoOpen(true)
  }, [])

  const handleClick = (id) => {
    if (id === 'scroll-left')  return scrollNav('left')
    if (id === 'scroll-right') return scrollNav('right')

    if (id === 'font')   { toggleZeichenTextbild2();  return }
    if (id === 'size')   { toggleZeilenTextbild2();   return }
    if (id === 'rotate') { toggleSpiegelnTextbild2(); return }
    if (id === 'color')  { toggleFarbenTextbild2();   return }

    if (id === 'align')  {
      const indices = collectActiveIndices()
      if (!indices.length) return infoNoSelection('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um zu zentrieren.')
      onAction?.('align', { indices })
      return
    }

    if (id === 'ascii') {
      const indices = collectActiveIndices()
      if (!indices.length) return infoNoSelection('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um ASCII umzuschalten.')
      onAction?.('ascii', { indices })
      return
    }

    // NEU: Klonen nur für Schnittmenge .active ∩ .edit
    if (id === 'clone') {
      const indices = collectActiveIndices()
      if (!indices.length) return infoNoSelection('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um es zu duplizieren.')
      onAction?.('clone', { indices })
      return
    }

    if (id === 'clear')  {
      const displayRoot = document.querySelector('figure.textbild2 .display')
      displayRoot?.querySelectorAll('pre.active').forEach(pre => {
        pre.classList.remove('active')
        pre.removeAttribute('aria-current')
      })
      const listRoot =
        document.querySelector('.wrapper_frame_list .frame_list') ||
        document.querySelector('.frame_list')
      listRoot?.querySelectorAll('.frame_group.show li.edit').forEach(li => {
        li.classList.remove('edit')
        li.removeAttribute('aria-current')
      })
      return
    }

    if (id === 'up' || id === 'down' || id === 'left' || id === 'right') {
      if (!hasSelection()) return infoNoSelection()
      onAction?.(id)
      return
    }

    if (id === 'delete') {
      if (hasSelection()) setConfirmOpen(true)
      else infoNoSelection('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um es zu löschen.')
      return
    }

    // Fallback für einfache Aktionen wie 'new'
    onAction?.(id)
  }

  return (
    <nav className="nav_optionen_pre" aria-label="Optionen Textbild 2.0" role="toolbar">
      <button
        type="button"
        className="scroll_btn"
        onClick={() => handleClick('scroll-left')}
        aria-label="Nach links scrollen"
        title="Nach links scrollen"
        disabled={!canLeft}
        aria-disabled={!canLeft}
      >
        <img src={icChevronLeft} alt="" aria-hidden="true" />
      </button>

      <ul ref={listRef}>
        {config.map(item => {
          const isFont   = item.id === 'font'
          const isSize   = item.id === 'size'
          const isRotate = item.id === 'rotate'
          const isColor  = item.id === 'color'

          const active =
            (isFont && showZeichenTextbild2) ||
            (isSize && showZeilenTextbild2) ||
            (isRotate && showSpiegelnTextbild2) ||
            (isColor && showFarbenTextbild2)

          const ariaProps =
            isFont   ? { 'aria-pressed': active, 'aria-expanded': active, 'aria-controls': fontPanelId } :
            isSize   ? { 'aria-pressed': active, 'aria-expanded': active, 'aria-controls': sizePanelId } :
            isRotate ? { 'aria-pressed': active, 'aria-expanded': active, 'aria-controls': rotatePanelId } :
            isColor  ? { 'aria-pressed': active, 'aria-expanded': active, 'aria-controls': colorPanelId } :
                       {}

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`icon_btn ${active ? 'active' : ''}`}
                onClick={() => handleClick(item.id)}
                aria-label={item.label}
                title={item.label}
                {...ariaProps}
              >
                <img src={item.icon} alt="" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="scroll_btn"
        onClick={() => handleClick('scroll-right')}
        aria-label="Nach rechts scrollen"
        title="Nach rechts scrollen"
        disabled={!canRight}
        aria-disabled={!canRight}
      >
        <img src={icChevronRight} alt="" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        message="Soll das Pre Element wirklich gelöscht werden?"
        onConfirm={() => { setConfirmOpen(false); onAction?.('delete') }}
        onCancel={() => setConfirmOpen(false)}
      />
      <InfoDialog
        open={infoOpen}
        title="Hinweis"
        message={infoText || 'Nichts ausgewählt.'}
        onClose={() => setInfoOpen(false)}
      />
    </nav>
  )
}
