// src/workspaces/WorkspaceSmsTextbild.jsx
import React, { forwardRef, useMemo } from 'react'
import DisplaySmsTextbild from '../components/display/DisplaySmsTextbild'

const WorkspaceSmsTextbild = forwardRef(function WorkspaceSmsTextbild(
  { rows = 32, cols = 64, frames = [], current = 0, onPrev, onNext, onRestart, onStop },
  ref
) {
  // Nur durchreichen; Grid kommt aus DisplaySmsTextbild
  const _ = useMemo(() => ({ rows, cols }), [rows, cols])
  return (
    <DisplaySmsTextbild
      ref={ref}
      rows={rows}
      cols={cols}
      frames={frames}
      current={current}
      onPrev={onPrev}
      onNext={onNext}
      onRestart={onRestart}
      onStop={onStop}
    />
  )
})

export default WorkspaceSmsTextbild
