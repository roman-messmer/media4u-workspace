import React from 'react'
import '../console/Console.css'
import chevronLeft from '../../assets/chevron-left.svg'
import chevronRight from '../../assets/chevron-right.svg'
import rotateLeft from '../../assets/arrow-rotate-left.svg'
import rotateRight from '../../assets/arrow-rotate-right.svg'

export default function Console({ 
  onPrev, 
  onRestart, 
  onStop, 
  onNext, 
  current = 0, 
  last = 0,
  label = "Display Console" // Dynamisches Label
}) {
  return (
    <nav className="console" aria-label={label}>
      <button type="button" aria-label="Frame zurück" onClick={onPrev} disabled={current === 0}>
        <img src={chevronLeft} alt="" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Animation neu starten" onClick={onRestart} disabled={current === 0}>
        <img src={rotateLeft} alt="" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Animation beenden" onClick={onStop} disabled={current === last}>
        <img src={rotateRight} alt="" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Frame weiter" onClick={onNext} disabled={current === last}>
        <img src={chevronRight} alt="" aria-hidden="true" />
      </button>
    </nav>
  )
}