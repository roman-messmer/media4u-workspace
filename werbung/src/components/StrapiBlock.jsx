import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import sanitizeHtml from '../utils/sanitizeHtml'

const resolveContent = (data) => data?.data?.attributes?.content ?? data?.content ?? ''

export default function StrapiBlock({ endpoint }) {
  const { i18n } = useTranslation()
  const [html, setHtml] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()
    const API = import.meta.env.VITE_STRAPI_URL
    const locale = i18n.language?.split('-')[0] || 'de'
    const url = `${API}/api/${endpoint}?locale=${encodeURIComponent(locale)}`
    setLoading(true); setError('')

    fetch(url, { signal: ctrl.signal })
      .then(r => { if(!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json() })
      .then(json => setHtml(resolveContent(json)))
      .catch(err => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [endpoint, i18n.language])

  const sanitized = useMemo(() => sanitizeHtml(html), [html])

  if (loading) return <div role="status" aria-busy="true">Lade…</div>
  if (error)   return <div role="alert" aria-live="assertive">Fehler: {error}</div>
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
