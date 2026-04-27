import React from 'react'
import '../optionen_frame/OptionenFrame.css'
import OptionenFrameSmsTextbild from './OptionenFrameSmsTextbild'
import OptionenFrameTextbild2 from './OptionenFrameTextbild2'

export default function OptionenFrame({ variant = 'sms', onAction }) {
  return variant === 'textbild2'
    ? <OptionenFrameTextbild2 onAction={onAction} />
    : <OptionenFrameSmsTextbild onAction={onAction} />
}
