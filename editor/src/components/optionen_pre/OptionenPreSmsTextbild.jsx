// src/components/optionen_pre/OptionenPreSmsTextbild.jsx
import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import '../optionen_pre/OptionenPre.css'
import { useUiToggles } from '../../context/UiToggleContext'

import icFile from '../../assets/file-lines.svg'
import icClone from '../../assets/clone.svg'
import icFont from '../../assets/font.svg'
import icAlignCenter from '../../assets/align-center.svg'
import icEraser from '../../assets/eraser.svg'
import icTrash from '../../assets/trash-can.svg'
import icChevronLeft from '../../assets/chevron-left.svg'
import icChevronRight from '../../assets/chevron-right.svg'

function ConfirmDialog({ open, title = 'Löschen bestätigen', message, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)
  const appRoot = document.querySelector('#root') || document.body

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.setAttribute('data-modal-open', 'true')

    const inertSupported = 'inert' in HTMLElement.prototype
    const prevAriaHidden = appRoot.getAttribute('aria-hidden')
    const prevInert = appRoot.inert
    try {
      if (inertSupported) appRoot.inert = true
      appRoot.setAttribute('aria-hidden', 'true')
    } catch {}

    const getFocusables = () =>
      dialogRef.current?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || []

    const focusFirst = () => {
      const items = getFocusables()
      items.length && items[0].focus()
    }

    const onKeyDown = (e) => {
      if (!dialogRef.current?.contains(document.activeElement)) return
      if (e.key === 'Escape') { e.preventDefault(); onCancel?.() }
      else if (e.key === 'Enter') { e.preventDefault(); onConfirm?.() }
      else if (e.key === 'Tab') {
        const items = Array.from(getFocusables())
        if (!items.length) return
        const first = items[0], last = items[items.length - 1]
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
      document.body.removeAttribute('data-modal-open')
      try {
        if (inertSupported) appRoot.inert = prevInert
        if (prevAriaHidden == null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', prevAriaHidden)
      } catch {}
      prevFocusRef.current?.focus?.()
    }
  }, [open, onCancel, onConfirm, appRoot])

  if (!open) return null
  const onBackdropMouseDown = (e) => { if (e.target === e.currentTarget) onCancel?.() }

  const modal = (
    <div className="confirm_backdrop" role="presentation" onMouseDown={onBackdropMouseDown} style={{ zIndex: 2147483647 }}>
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
        <div className="confirm_actions_sms">
          <button type="button" className="btn yes" onClick={() => onConfirm?.()}>Ja</button>
          <button type="button" className="btn no" onClick={() => onCancel?.()}>Nein</button>
        </div>
      </div>
    </div>
  )
  return createPortal(modal, document.body)
}

function InfoDialog({ open, title = 'Hinweis', message, onClose }) {
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)
  const appRoot = document.querySelector('#root') || document.body

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.setAttribute('data-modal-open', 'true')

    const inertSupported = 'inert' in HTMLElement.prototype
    const prevAriaHidden = appRoot.getAttribute('aria-hidden')
    const prevInert = appRoot.inert
    try {
      if (inertSupported) appRoot.inert = true
      appRoot.setAttribute('aria-hidden', 'true')
    } catch {}

    const getFocusables = () =>
      dialogRef.current?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || []

    const focusFirst = () => {
      const items = getFocusables()
      items.length && items[0].focus()
    }

    const onKeyDown = (e) => {
      if (!dialogRef.current?.contains(document.activeElement)) return
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClose?.()
      } else if (e.key === 'Tab') {
        const items = Array.from(getFocusables())
        if (!items.length) return
        const first = items[0], last = items[items.length - 1]
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
      document.body.removeAttribute('data-modal-open')
      try {
        if (inertSupported) appRoot.inert = prevInert
        if (prevAriaHidden == null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', prevAriaHidden)
      } catch {}
      prevFocusRef.current?.focus?.()
    }
  }, [open, onClose, appRoot])

  if (!open) return null
  const onBackdropMouseDown = (e) => { if (e.target === e.currentTarget) onClose?.() }

  const modal = (
    <div className="confirm_backdrop" role="presentation" onMouseDown={onBackdropMouseDown} style={{ zIndex: 2147483647 }}>
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
        <div className="confirm_actions_sms">
          <button type="button" className="btn no" onClick={() => onClose?.()}>OK</button>
        </div>
      </div>
    </div>
  )
  return createPortal(modal, document.body)
}

export default function OptionenPreSmsTextbild({ onAction }) {
  const listRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoText, setInfoText] = useState('')
  const { showZeichenSms, toggleZeichenSms } = useUiToggles()

  const panelId = 'zeichen-panel'

  const config = useMemo(() => ([
    { id: 'new',    label: 'Neues Pre',        icon: icFile },
    { id: 'clone',  label: 'Pre duplizieren',  icon: icClone },
    { id: 'font',   label: 'Schriftart',       icon: icFont },
    { id: 'align',  label: 'Zentrieren',       icon: icAlignCenter },
    { id: 'clear',  label: 'class bereinigen', icon: icEraser },
    { id: 'delete', label: 'Löschen',          icon: icTrash },
  ]), [])

  const getRoots = useCallback(() => {
    const displayRoot = document.querySelector('figure.sms_textbild .display')
    const listRoot =
      document.querySelector('.wrapper_frame_list .frame_list') ||
      document.querySelector('.frame_list')
    const activeFrame = displayRoot?.querySelector('.frame.show') || null
    const activeGroup = listRoot?.querySelector('.frame_group.show') || null
    return { activeFrame, activeGroup }
  }, [])

  const hasSelection = useCallback(() => {
    const { activeFrame, activeGroup } = getRoots()
    const hasActive = !!activeFrame?.querySelector('pre.active')
    const hasEdit = !!activeGroup?.querySelector('li.edit')
    return hasActive || hasEdit
  }, [getRoots])

  // Schnittmenge aus pre.active im aktiven Frame und li.edit in der aktiven Liste
  const collectActiveIndices = useCallback(() => {
    const { activeFrame, activeGroup } = getRoots()
    if (!activeFrame || !activeGroup) return []

    const preActives = Array.from(activeFrame.querySelectorAll('pre.active'))
      .map(pre => parseInt(pre.dataset.index || '-1', 10))
      .filter(i => Number.isInteger(i) && i >= 0)

    const liAll = Array.from(activeGroup.querySelectorAll('li'))
    const liEdits = Array.from(activeGroup.querySelectorAll('li.edit'))
    const liEditIdx = liEdits
      .map(li => liAll.indexOf(li))
      .filter(i => Number.isInteger(i) && i >= 0)

    const intersection = preActives.filter(i => liEditIdx.includes(i))
    return Array.from(new Set(intersection)).sort((a, b) => a - b)
  }, [getRoots])

  const doAlign = () => {
    const indices = collectActiveIndices()
    if (!indices.length) {
      setInfoText('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um das pre Element im Display zu zentrieren.')
      setInfoOpen(true)
      return
    }
    onAction?.('align', { indices })
  }

  // NEU: Klonen nur für Schnittmenge .active ∩ .edit
  const doClone = () => {
    const indices = collectActiveIndices()
    if (!indices.length) {
      setInfoText('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um das pre Element zu duplizieren.')
      setInfoOpen(true)
      return
    }
    onAction?.('clone', { indices })
  }

  const doClearClasses = () => {
    const { activeFrame, activeGroup } = getRoots()
    if (activeFrame) {
      activeFrame.querySelectorAll('pre.active').forEach(pre => {
        pre.classList.remove('active')
        pre.removeAttribute('aria-current')
      })
    }
    if (activeGroup) {
      activeGroup.querySelectorAll('li.edit').forEach(li => {
        li.classList.remove('edit')
        li.removeAttribute('aria-current')
      })
    }
  }

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

  const scrollNav = (direction) => {
    const el = listRef.current
    if (!el) return
    const scrollAmount = 160
    const maxScrollLeft = el.scrollWidth - el.clientWidth
    const current = el.scrollLeft
    const next = direction === 'left'
      ? Math.max(0, current - scrollAmount)
      : Math.min(maxScrollLeft, current + scrollAmount)
    el.scrollTo({ left: next, behavior: 'smooth' })
  }

  const handleClick = (id) => {
    if (id === 'scroll-left')  return scrollNav('left')
    if (id === 'scroll-right') return scrollNav('right')
    if (id === 'font') { toggleZeichenSms(); return }
    if (id === 'new') { onAction?.(id); return }
    if (id === 'clone') { doClone(); return } // geändert
    if (id === 'align') { doAlign(); return }
    if (id === 'clear') { doClearClasses(); return }
    if (id === 'delete') {
      if (hasSelection()) {
        setConfirmOpen(true)
      } else {
        setInfoText('Nichts ausgewählt. Bitte dasselbe Element im aktiven Frame markieren, um das Element zu löschen.')
        setInfoOpen(true)
      }
      return
    }
  }

  const confirmDelete = () => { setConfirmOpen(false); onAction?.('delete') }
  const cancelDelete  = () => { setConfirmOpen(false) }
  const closeInfo     = () => { setInfoOpen(false) }

  return (
    <nav className="nav_optionen_pre" aria-label="Optionen SMS Textbild" role="toolbar" data-testid="pre-toolbar">
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
          const isFont = item.id === 'font'
          const active = isFont && showZeichenSms
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`icon_btn ${active ? 'active' : ''}`}
                onClick={() => handleClick(item.id)}
                aria-label={item.label}
                title={item.label}
                data-testid={`pre-action-${item.id}`}
                {...(isFont ? {
                  'aria-pressed': active,
                  'aria-expanded': active,
                  'aria-controls': panelId
                } : {})}
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
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <InfoDialog
        open={infoOpen}
        title="Hinweis"
        message={infoText || 'Nichts ausgewählt.'}
        onClose={closeInfo}
      />
    </nav>
  )
}
