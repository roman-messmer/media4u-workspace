import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import sanitizeHtml from '../../utils/sanitizeHtml.js'
import '../vorlagen/Vorlagen.css'
import Anker from "../anker/anker.jsx"

function resolveContent(data) {
  if (!data) return ''
  const d = data.data

  // Single type (Strapi v4/v5)
  if (d && !Array.isArray(d)) {
    return (
      d.attributes?.content ??
      d.attributes?.html ??
      d.content ??
      d.html ??
      ''
    )
  }

  // Collection type
  if (Array.isArray(d) && d.length) {
    const first = d[0]
    return (
      first?.attributes?.content ??
      first?.attributes?.html ??
      first?.content ??
      first?.html ??
      ''
    )
  }

  // Fallback
  const cands = [data?.content, data?.html].filter(Boolean)
  return String(cands[0] || '')
}

export default function Vorlagen({ endpoint = 'vorlagen', contentOverride }) {
  const { i18n } = useTranslation()
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1) Lokaler Override: direkt setzen, kein Fetch
    if (contentOverride) {
      setContent(contentOverride)
      setError(null)
      setLoading(false)
      return
    }

    // 2) Optionaler Strapi-Fetch (falls später doch gewünscht)
    const ctrl = new AbortController()
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const locale = i18n?.language?.split?.('-')?.[0] || 'de'
        const base = import.meta.env.VITE_STRAPI_URL?.replace(/\/+$/, '') || ''
        const url = `${base}/api/${endpoint}?locale=${encodeURIComponent(locale)}`
        const headers = { Accept: 'application/json' }

        const res = await fetch(url, { signal: ctrl.signal, headers })

        if (res.status === 404) {
          const res2 = await fetch(`${base}/api/${endpoint}`, { signal: ctrl.signal, headers })
          if (!res2.ok) throw new Error(`HTTP ${res2.status} ${res2.statusText}`)
          const json2 = await res2.json()
          if (!cancelled) setContent(resolveContent(json2))
        } else {
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
          const json = await res.json()
          if (!cancelled) setContent(resolveContent(json))
        }
      } catch (e) {
        if (e.name !== 'AbortError' && !cancelled) {
          setError(e)
          setContent('')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [i18n?.language, endpoint, contentOverride])

  const isHtml = useMemo(() => /<\/?[a-z][\s\S]*>/i.test(content), [content])
  const sanitizedHtml = useMemo(() => (isHtml ? sanitizeHtml(content) : ''), [content, isHtml])
  const plain = useMemo(() => (isHtml ? '' : String(content ?? '')), [content, isHtml])

  if (loading) {
    return (
      <section className="vorlagen section loading" aria-busy="true" aria-live="polite" data-state="loading">
        <div className="skeleton line" />
        <div className="skeleton line" />
        <div className="skeleton block" />
      </section>
    )
  }

  if (error) {
    return (
      <section className="vorlagen section error" role="alert" aria-live="assertive" data-state="error">
        <h2 className="error_title">Inhalt konnte nicht geladen werden</h2>
        <p className="error_message">{error.message}</p>
      </section>
    )
  }

  if (!content) {
    return (
      <section className="vorlagen section empty" aria-live="polite" data-state="empty">
        <p>Kein Inhalt verfügbar</p>
      </section>
    )
  }

  return (
    <section className="vorlagen section success" aria-live="polite" data-state="success">
      {isHtml ? (
        <div className="vorlagen_content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      ) : (
        <pre className="vorlagen_pre">{plain}</pre>
      )}
      <Anker />
    </section>
  )
}
