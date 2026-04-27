import React from 'react'
import Vorlagen from '../components/vorlagen/Vorlagen'
import WorkspaceVorlagen from '../workspaces/WorkspaceVorlagen'
// Vite: statische Datei als String laden
import htmlContent from '../context/vorlagen.html?raw'

export default function VorlagenPage() {
  return (
    <WorkspaceVorlagen>
      {/* Lokaler HTML-Inhalt ohne Strapi */}
      <Vorlagen endpoint="vorlagen" contentOverride={htmlContent} />
    </WorkspaceVorlagen>
  )
}
