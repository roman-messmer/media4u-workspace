// src/components/optionen_pre/OptionenPre.jsx
import React, { useEffect } from 'react'
import '../optionen_pre/OptionenPre.css'

import OptionenPreTextbild2 from './OptionenPreTextbild2'
import OptionenPreSmsTextbild from './OptionenPreSmsTextbild'

import Zeichen from '../auswahl/Zeichen'
import Zeichen2 from '../auswahl/Zeichen2'
import { useUiToggles } from '../../context/UiToggleContext'

/**
 * Props:
 * - variant: "sms" | "textbild2"
 * - includePanel?: boolean  // neu: Panel hier rendern oder nicht
 * - onAction?: (id: string) => void
 */
export default function OptionenPre({ variant = 'sms', includePanel = true, onAction }) {
  const {
    showZeichenSms,
    setShowZeichenSms,
    showZeichenTextbild2,
    setShowZeichenTextbild2,
  } = useUiToggles()

  useEffect(() => {
    if (variant === 'sms') {
      if (showZeichenTextbild2) setShowZeichenTextbild2(false)
    } else if (variant === 'textbild2') {
      if (showZeichenSms) setShowZeichenSms(false)
    }
  }, [variant, showZeichenSms, showZeichenTextbild2, setShowZeichenSms, setShowZeichenTextbild2])

  if (variant === 'textbild2') {
    return (
      <>
        <OptionenPreTextbild2 onAction={onAction} />
        {includePanel && showZeichenTextbild2 && <Zeichen2 />}
      </>
    )
  }

  return (
    <>
      <OptionenPreSmsTextbild onAction={onAction} />
      {includePanel && showZeichenSms && <Zeichen />}
    </>
  )
}
