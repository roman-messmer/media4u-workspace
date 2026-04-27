// src/components/auswahl/Color.jsx
import React, { useCallback } from 'react'
import { useFrameNav, COLOR_CLASSES, COLOR_CLASS_MAP } from '../../context/FrameNavContext'

/**
 * Optional Props:
 * - mode: 'text' | 'background'
 * - onPick?: (cssName: string) => void
 */
export default function Color({ mode = 'text', onPick }) {
  const groups = [
    ['black','dimgray','gray','darkgray','silver','lightgrey','whitesmoke','white','darkred','firebrick','crimson','red','indianred','lightcoral','salmon','darksalmon','lightsalmon','hotpink','deeppink','mediumvioletred','palevioletred','lightpink','pink','thistle','plum','violet','orchid','magenta','fuchsia','mediumorchid','darkorchid','darkviolet','purple','mediumpurple','rebeccapurple','blueviolet','indigo','darkslateblue','slateblue','mediumslateblue','darkblue','mediumblue','blue','royalblue','steelblue','dodgerblue','deepskyblue','cornflowerblue','skyblue','lightskyblue','lightblue','powderblue','aqua','cyan','paleturquoise','aquamarine','turquoise','mediumturquoise','darkturquoise','lightseagreen','cadetblue','darkcyan','teal','darkgreen','green','forestgreen','seagreen','mediumseagreen','springgreen','mediumspringgreen','lightgreen','palegreen','darkseagreen','mediumaquamarine','yellowgreen','lawngreen','chartreuse','limegreen','lime','greenyellow','olivedrab','olive','darkolivegreen','darkkhaki','khaki','yellow','gold','lightgoldenrodyellow','lemonchiffon','lightyellow','orange','darkorange','coral','lightsalmon','sandybrown','chocolate','sienna','brown','maroon','beige','antiquewhite','burlywood','wheat','tan','rosybrown','moccasin','navajowhite','peachpuff','mistyrose','lavenderblush','linen','oldlace','papayawhip','seashell','mintcream','azure','aliceblue','ghostwhite'
      // 'snow' hier bewusst weggelassen, solange keine .Snow Klasse existiert.
    ],
  ]

  // Robust: nutze Mapping aus dem Context
  const toClass = useCallback((cssName) => {
    const key = String(cssName || '').toLowerCase()
    return COLOR_CLASS_MAP[key] || null
  }, [])

  const nav = (() => { try { return useFrameNav?.() ?? {} } catch { return {} } })()

  // DOM-Fallback, falls Context-API fehlt
  const applyColorDomFallback = useCallback((className) => {
    if (!className) return
    const frame =
      document.querySelector('figure.textbild2 .display .frame.show') ||
      document.querySelector('figure.textbild2 .display')
    if (!frame) return
    const actives = frame.querySelectorAll('pre.active')
    actives.forEach(el => {
      COLOR_CLASSES.forEach(c => el.classList.remove(c))
      el.classList.add(className)
      el.style.color = ''              // evtl. alte Inline-Farben löschen
      el.removeAttribute('data-color')
    })
  }, [])

  const pick = useCallback((cssName) => {
    if (typeof onPick === 'function') onPick(cssName)
    if (mode === 'background') {
      // später ggf. BG-Klassen ergänzen
      return
    }
    const className = toClass(cssName) // z. B. 'MediumVioletRed'
    if (!className) return
    if (typeof nav.setColorForActiveItems === 'function') {
      nav.setColorForActiveItems(className)
    } else {
      applyColorDomFallback(className)
    }
  }, [mode, nav, onPick, toClass, applyColorDomFallback])

  return (
    <div className="palette" role="region" aria-label={mode === 'background' ? 'Hintergrundfarben' : 'Schriftfarben'}>
      {groups.map((row, ri) => (
        <div className="palette_row" key={ri} role="group">
          {row.map((c) => (
            <button
              key={c}
              type="button"
              className="palette_swatch"
              style={{ backgroundColor: c }}
              aria-label={c}
              title={c}
              onClick={() => pick(c)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
