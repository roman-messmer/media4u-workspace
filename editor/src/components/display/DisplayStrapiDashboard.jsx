import React from 'react'
import '../display/Display.css' // nutzt dein vorhandenes Display-Layout

export default function DisplayStrapiDashboard({ children }) {
  return (
    <div className="container display">
      <div className="display_area">
        {children}
      </div>
    </div>
  )
}
