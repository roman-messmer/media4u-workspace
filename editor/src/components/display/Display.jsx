import React from 'react'
import { useLocation } from 'react-router-dom'
import DisplaySmsTextbild from './DisplaySmsTextbild'
import DisplayTextbild2 from './DisplayTextbild2'
import DisplayVorlagen from './DisplayVorlagen'

export default function Display() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/sms_textbild')) return <DisplaySmsTextbild />
  if (pathname.startsWith('/textbild2'))    return <DisplayTextbild2 />
  if (pathname.startsWith('/vorlagen'))     return <DisplayVorlagen />
  return <DisplayVorlagen />
}
