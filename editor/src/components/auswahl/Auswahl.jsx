import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Zeichen from './Zeichen'
import Zeichen2 from './Zeichen2'
import Zeilen from './Zeilen'
import SpiegelnDrehen from './SpiegelnDrehen'
import Color from './Color'
import StrapiSMSTextbild from "./Strapi_sms_textbild"
import StrapiTextbild2 from "./Strapi_textbild2"
import { useUiToggles } from '../../context/UiToggleContext'

import '../auswahl/Auswahl.css'
import '../../../fonts/fonts.css'

export default function Auswahl() {
  const location = useLocation()
  const {
    showZeichenSms,
    showZeichenTextbild2,
    showZeilenTextbild2,
    showSpiegelnTextbild2,
    showFarbenTextbild2,
    showStrapiTextbild2,
    showStrapiSMSTextbild,
  } = useUiToggles()

  const route = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/sms_textbild')) return 'sms'
    if (p.startsWith('/textbild2')) return 'textbild2'
    if (p.startsWith('/vorlagen')) return 'vorlagen'
    return 'other'
  }, [location.pathname])

  if (route === 'sms') {
    return (
      <div className="optionen_auswahl_sms_textbild">
        {showZeichenSms && (
          <div className="zeichen" role="region" aria-label="Zeichenauswahl">
            <Zeichen />
          </div>
        )}

        {showStrapiSMSTextbild && (
          <div id="strapi-sms-textbild-panel" className="strapi_sms_textbild" role="region" aria-label="Strapi_sms_textbild Auswahl">
            <StrapiSMSTextbild />
          </div>
        )}
      </div>
    )
  }

  if (route === 'textbild2') {
    return (
      <div className="optionen_auswahl_textbild2">
        {showZeichenTextbild2 && (
          <div id="zeichen2-panel" className="zeichen2" role="region" aria-label="Zeichenauswahl erweitert">
            <Zeichen2 />
          </div>
        )}

        {showZeilenTextbild2 && (
          <div id="zeilen-panel" className="zeilen" role="region" aria-label="Zeilen und Textgröße">
            <Zeilen />
          </div>
        )}

        {showSpiegelnTextbild2 && (
          <div id="spiegeln-panel" className="spiegeln_drehen" role="region" aria-label="Spiegeln und Drehen">
            <SpiegelnDrehen />
          </div>
        )}

        {showFarbenTextbild2 && (
          <div id="farben-panel" className="zeichen_farben" role="region" aria-label="Farben">
            <Color />
          </div>
        )}

        {showStrapiTextbild2 && (
          <div id="strapi-textbild2-panel" className="strapi_textbild2" role="region" aria-label="strapi_textbild2 Auswahl">
            <StrapiTextbild2 />
          </div>
        )}
      </div>
    )
  }

  if (route === 'vorlagen') return null
  return null
}