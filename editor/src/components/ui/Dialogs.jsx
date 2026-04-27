// src/components/ui/Dialogs.jsx
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, variantClass = 'sms' }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Fokus-Falle Logik hier (einmal zentral implementiert)
    return () => { document.body.style.overflow = prevOverflow }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="confirm_backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="confirm_modal" ref={dialogRef} role="alertdialog" aria-modal="true">
        <h2 className="confirm_title">{title}</h2>
        <p className="confirm_message">{message}</p>
        <div className={`confirm_actions_${variantClass}`}>
          <button type="button" className="btn yes" onClick={onConfirm}>Ja</button>
          <button type="button" className="btn no" onClick={onCancel}>Nein</button>
        </div>
      </div>
    </div>,
    document.body
  )
}