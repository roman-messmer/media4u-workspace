// src/components/pages/FrontEndDeveloper.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import '../../css/ZoomIn.css';

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const ENDPOINT = 'media4u-frontend-entwickler';

const contentCache = new Map();

function resolveContent(apiResponse) {
  const raw = apiResponse?.data;

  if (Array.isArray(raw)) {
    const first = raw[0]?.attributes ?? raw[0] ?? {};
    return normalize(first);
  }

  const node = raw?.attributes ?? raw ?? apiResponse ?? {};
  return normalize(node);

  function normalize(root = {}) {
    return {
      frontend_entwickler: root.frontend_entwickler ?? '',
    };
  }
}

function useStrapiContent(endpoint, locale, { timeoutMs = 12000 } = {}) {
  const BASE_URL = import.meta.env.VITE_STRAPI_URL;
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = `${endpoint}::${locale}`;
  const mountedRef = useRef(true);

  const url = useMemo(() => {
    if (!BASE_URL) return null;
    const u = new URL(`/api/${endpoint}`, BASE_URL.replace(/\/+$/, ''));
    u.searchParams.set('locale', locale);
    return u.toString();
  }, [BASE_URL, endpoint, locale]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: 'VITE_STRAPI_URL ist nicht gesetzt.' });
      return;
    }

    const cached = contentCache.get(key);
    if (cached) {
      setState({ data: cached, loading: false, error: null });
      return;
    }

    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), timeoutMs);

    (async () => {
      setState({ data: null, loading: true, error: null });
      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) {
          let msg = `HTTP ${res.status}: ${res.statusText}`;
          if (res.status === 404) msg = 'Inhalt nicht gefunden (404).';
          if (res.status === 401 || res.status === 403) msg = 'Nicht autorisiert, prüfe Public Permissions.';
          throw new Error(msg);
        }
        const json = await res.json();
        const resolved = resolveContent(json);

        contentCache.set(key, resolved);
        if (mountedRef.current) setState({ data: resolved, loading: false, error: null });
      } catch (err) {
        if (err.name === 'AbortError') {
          if (mountedRef.current) setState({ data: null, loading: false, error: 'Zeitüberschreitung oder abgebrochen.' });
        } else {
          if (mountedRef.current) setState({ data: null, loading: false, error: err.message || 'Unbekannter Fehler.' });
        }
      } finally {
        clearTimeout(tid);
      }
    })();

    return () => {
      clearTimeout(tid);
      ac.abort();
    };
  }, [url, key, timeoutMs]);

  return state;
}

const FrontEndDeveloper = () => {
  const { i18n } = useTranslation();
  const lang = i18n?.language?.split('-')[0] || 'de';

  const { data: content, loading, error } = useStrapiContent(ENDPOINT, lang);

  useEffect(() => {
    if (!loading && content) {
      const cleanup = observeVisibility({ once: true });
      return cleanup;
    }
  }, [loading, content]);

  const sanitizedHtml = useMemo(() => {
    if (!content?.frontend_entwickler) return { __html: '' };
    return { __html: sanitizeHtml(content.frontend_entwickler) };
  }, [content]);

  return (
    <main
      className="frontend-developer-page"
      aria-busy={loading ? 'true' : 'false'}
      aria-live="polite"
    >
      <DynamicSEO page="frontend_developer" lang={lang} />

      {loading && (
        <div role="status" className="status loading">
          <span className="spinner" aria-hidden="true" />
          <span>Inhalte werden geladen …</span>
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="status error">
          <p>Fehler beim Laden der Inhalte: {error}</p>
        </div>
      )}

      {/* Hier wird nun das gesamte in Strapi definierte HTML 
        (inklusive <header> und <article>) direkt gerendert 
      */}
      {!loading && !error && content && (
        <div 
          className="strapi-content-wrapper" 
          dangerouslySetInnerHTML={sanitizedHtml} 
        />
      )}
    </main>
  );
};

export default FrontEndDeveloper;