import React from 'react'
import '../quellcode/Quellcode.css'
import QuellcodeSmsTextbild from './QuellcodeSmsTextbild'
import QuellcodeTextbild2 from './QuellcodeTextbild2'

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - variant: 'sms' | 'textbild2'
 * - displayRef?: React.RefObject<HTMLElement>
 */
export default function Quellcode({ isOpen = false, onClose, variant = 'sms', displayRef }) {
  if (!isOpen) return null
  return (
    <>
      {variant === 'textbild2' ? (
        <QuellcodeTextbild2 isOpen={isOpen} onClose={onClose} displayRef={displayRef} />
      ) : (
        <QuellcodeSmsTextbild isOpen={isOpen} onClose={onClose} displayRef={displayRef} />
      )}
    </>
  )
}
