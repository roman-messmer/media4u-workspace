import React from 'react'
import { useLocation } from 'react-router-dom'
import '../frame_list/FrameList.css'
import FrameListSmsTextbild from './FrameListSmsTextbild'
import FrameListTextbild2 from './FrameListTextbild2'

export default function FrameList() {
  const { pathname } = useLocation()
  const isSMS = pathname.startsWith('/sms_textbild')
  const isTB2 = pathname.startsWith('/textbild2')

  return (
    <div className="frame_list" aria-label="Frameliste"
         data-variant={isSMS ? 'sms' : isTB2 ? 'textbild2' : 'none'}>
      {isSMS && <FrameListSmsTextbild />}
      {isTB2 && <FrameListTextbild2 />}
    </div>
  )
}
