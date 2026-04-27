// src/components/optionen_frame/OptionenFrameTextbild2.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react'
import '../optionen_frame/OptionenFrame.css'

import icNewspaper from '../../assets/newspaper.svg'
import icClone from '../../assets/clone.svg'
import icTrash from '../../assets/trash-can.svg'
import icSave from '../../assets/floppy-disk.svg'
import icCode from '../../assets/code.svg'
import icUp from '../../assets/arrow-up.svg'
import icDown from '../../assets/arrow-down.svg'
import icChevronLeft from '../../assets/chevron-left.svg'
import icChevronRight from '../../assets/chevron-right.svg'
import icStrapi from '../../assets/strapi.svg'
import { useUiToggles } from '../../context/UiToggleContext'

/**
 * Zugänglicher Bestätigungsdialog
 * - Fokusfalle für alle fokussierbaren Elemente
 * - Escape schließt, Enter bestätigt
 * - Klick auf Backdrop schließt
 * - Body-Scroll wird gesperrt solange offen
 */
function ConfirmDialog({ open, title = 'Löschen bestätigen', message, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current = document.activeElement

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusables = () =>
      dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || []

    const focusFirst = () => {
      const items = getFocusables()
      if (items.length) items[0].focus()
    }

    const onKeyDown = (e) => {
      if (!dialogRef.current?.contains(document.activeElement)) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel?.()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm?.()
      } else if (e.key === 'Tab') {
        const items = Array.from(getFocusables())
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    const t = setTimeout(focusFirst, 0)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocusedRef.current?.focus?.()
    }
  }, [open, onCancel, onConfirm])

  if (!open) return null

  const onBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onCancel?.()
  }

  return (
    <div
      className="confirm_backdrop"
      role="presentation"
      onMouseDown={onBackdropMouseDown}
    >
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
          <button type="button" className="btn yes" onClick={() => onConfirm?.()}>
            Ja
          </button>
          <button type="button" className="btn no" onClick={() => onCancel?.()}>
            Nein
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OptionenFrameTextbild2({ onAction }) {
  const listRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { showStrapiTextbild2, toggleStrapiTextbild2 } = useUiToggles()

  const config = [
    { id: 'new',    label: 'Neues Frame',         icon: icNewspaper },
    { id: 'clone',  label: 'Frame duplizieren',   icon: icClone },
    { id: 'up',     label: 'Nach oben',           icon: icDown },
    { id: 'down',   label: 'Nach unten',          icon: icUp },
    { id: 'save',   label: 'Speichern',           icon: icSave },
    { id: 'delete', label: 'Löschen',             icon: icTrash },
    { id: 'code',   label: 'Code anzeigen',       icon: icCode },
    { id: 'strapi', label: 'Strapi anzeigen',     icon: icStrapi },
  ]

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
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateArrows)
    }
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
    const maxScrollLeft = el.scrollWidth - el.clientWidth
    const current = el.scrollLeft
    const next =
      direction === 'left'
        ? Math.max(0, current - scrollAmount)
        : Math.min(maxScrollLeft, current + scrollAmount)
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

  const handleClick = (id) => {
    if (id === 'scroll-left') return scrollNav('left')
    if (id === 'scroll-right') return scrollNav('right')
    if (id === 'strapi') {
      toggleStrapiTextbild2()
      return
    }
    if (id === 'delete') {
      setConfirmOpen(true)
      return
    }
    onAction?.(id)
  }

  const confirmDelete = () => {
    setConfirmOpen(false)
    onAction?.('delete')
  }

  const cancelDelete = () => setConfirmOpen(false)

  return (
    <nav className="nav_optionen_frame" aria-label="Optionen Frame" role="toolbar">
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
          const active = item.id === 'strapi' && showStrapiTextbild2
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`icon_btn${active ? ' active' : ''}`}
                onClick={() => handleClick(item.id)}
                aria-label={item.label}
                title={item.label}
                aria-pressed={active}
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
        message="Soll das Frame Element wirklich gelöscht werden?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </nav>
  )
}
