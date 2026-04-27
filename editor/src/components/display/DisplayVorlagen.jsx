import React from 'react'

export default function DisplayVorlagen({ children }) {
  return (
    <div className="container display">
      <div className="display_area">
        {children}
      </div>
    </div>
  )
}
