import React, { createContext, useContext, useMemo, useState } from 'react'

const UiToggleContext = createContext(null)

export function UiToggleProvider({ children }) {
  const [showZeichenSms, setShowZeichenSms] = useState(false)
  const [showStrapiSMSTextbild, setShowStrapiSMSTextbild] = useState(false)
  const [showZeichenTextbild2, setShowZeichenTextbild2] = useState(false)

  const [showZeilenTextbild2, setShowZeilenTextbild2] = useState(false)
  const [showSpiegelnTextbild2, setShowSpiegelnTextbild2] = useState(false)
  const [showFarbenTextbild2, setShowFarbenTextbild2] = useState(false)
  const [showStrapiTextbild2, setShowStrapiTextbild2] = useState(false)

  const value = useMemo(() => ({
    showZeichenSms,
    setShowZeichenSms,
    toggleZeichenSms: () => setShowZeichenSms(v => !v),

    showStrapiSMSTextbild,
    setShowStrapiSMSTextbild,
    toggleStrapiSMSTextbild: () => setShowStrapiSMSTextbild(v => !v),

    showZeichenTextbild2,
    setShowZeichenTextbild2,
    toggleZeichenTextbild2: () => setShowZeichenTextbild2(v => !v),

    showZeilenTextbild2,
    setShowZeilenTextbild2,
    toggleZeilenTextbild2: () => setShowZeilenTextbild2(v => !v),

    showSpiegelnTextbild2,
    setShowSpiegelnTextbild2,
    toggleSpiegelnTextbild2: () => setShowSpiegelnTextbild2(v => !v),

    showFarbenTextbild2,
    setShowFarbenTextbild2,
    toggleFarbenTextbild2: () => setShowFarbenTextbild2(v => !v),

    showStrapiTextbild2,
    setShowStrapiTextbild2,
    toggleStrapiTextbild2: () => setShowStrapiTextbild2(v => !v),
  }), [
    showZeichenSms,
    showStrapiSMSTextbild,
    showZeichenTextbild2,
    showZeilenTextbild2,
    showSpiegelnTextbild2,
    showFarbenTextbild2,
    showStrapiTextbild2,
  ])

  return <UiToggleContext.Provider value={value}>{children}</UiToggleContext.Provider>
}

export function useUiToggles() {
  const ctx = useContext(UiToggleContext)
  if (!ctx) throw new Error('useUiToggles must be used within UiToggleProvider')
  return ctx
}
