import React, { forwardRef } from 'react'
import DisplayTextbild2 from '../components/display/DisplayTextbild2'

const WorkspaceTextbild2 = forwardRef(function WorkspaceTextbild2(
  { rows = 48, cols = 128, frames = [], current = 0, onPrev, onNext, onRestart, onStop },
  ref
) {
  return (
    <DisplayTextbild2
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

export default WorkspaceTextbild2
