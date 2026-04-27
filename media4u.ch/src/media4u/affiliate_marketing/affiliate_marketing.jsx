import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";
import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

// --- In-Memory Cache per Session (endpoint+locale) ---
const contentCache = new Map();

const ENDPOINT = 'media4u-affiliate-marketing';

/** Robust against Strapi v4 (Single/Collection) & Structure Drift */
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
      title: root.h1_title ?? '',
      h2_info: root.h2_info ?? '',
      p_info: root.p_info ?? '',
      h2_was_sind_affiliate_links: root.h2_was_sind_affiliate_links ?? '',
      p_was_sind_affiliate_links: root.p_was_sind_affiliate_links ?? '',
      h2_warum_affiliate_links: root.h2_warum_affiliate_links ?? '',
      p_warum_affiliate_links: root.p_warum_affiliate_links ?? '',
      h2_wie_funktioniert_tracking: root.h2_wie_funktioniert_tracking ?? '',
      p_wie_funktioniert_tracking: root.p_wie_funktioniert_tracking ?? '',
      h2_keine_nachteile: root.h2_keine_nachteile ?? '',
      p_keine_nachteile: root.p_keine_nachteile ?? '',
      h2_haftungsausschluss: root.h2_haftungsausschluss ?? '',
      p_haftungsausschluss: root.p_haftungsausschluss ?? '',
      h2_transparenz_vertrauen: root.h2_transparenz_vertrauen ?? '',
      p_transparenz_vertrauen: root.p_transparenz_vertrauen ?? '',
      image: root.image?.url || 'https://cms.media4u.ch/uploads/media4u_affiliate_marketing_bild_1_833091ef9f.jpg'
    };
  }
}

/** Generic Sanitization */
function sanitizeFields(obj, htmlFields) {
  const out = {};
  const toSafe = (html) => ({ __html: sanitizeHtml(html || '') });
  for (const key of htmlFields) out[key] = toSafe(obj?.[key]);
  return out;
}

/** Reusable Hook for Strapi Content */
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
          if (mountedRef.current) setState({ data: null, loading: false, error: 'Zeitüberschreitung/abgebrochen.' });
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

const AffiliateMarketing = () => {
  const { i18n } = useTranslation();
  const lang = i18n?.language?.split('-')[0] || 'de';

  const { data: content, loading, error } = useStrapiContent(ENDPOINT, lang);

  const htmlFields = useMemo(
    () => [
      'p_info', 'p_was_sind_affiliate_links', 'p_warum_affiliate_links', 'p_wie_funktioniert_tracking', 
      'p_keine_nachteile', 'p_haftungsausschluss', 'p_transparenz_vertrauen',
    ],
    []
  );

  const sanitized = useMemo(() => (content ? sanitizeFields(content, htmlFields) : {}), [content, htmlFields]);

  useEffect(() => {
    if (!loading && content) {
      const cleanup = observeVisibility({ once: true });
      return cleanup;
    }
  }, [loading, content]);

  return (
    <main
      className="affiliate-marketing-page"
      aria-busy={loading ? 'true' : 'false'}
      aria-live="polite"
    >
      <DynamicSEO page="affiliate_marketing" lang={lang} />

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

      {!loading && !error && content && (
        <>
          <header>
            <h1>{content.title}</h1>
            <h2>{content.h2_info}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_info} />
          </header>

          <article>
            <figure className="figure">
              <img
                src={content.image}
                alt="Affiliate Marketing"
                className="responsive-image zoom-in"
                loading="lazy"
              />
            </figure>
            
            <h2>{content.h2_was_sind_affiliate_links}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_was_sind_affiliate_links} />

            <h2>{content.h2_warum_affiliate_links}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_warum_affiliate_links} />

            <h2>{content.h2_wie_funktioniert_tracking}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_wie_funktioniert_tracking} />

            <h2>{content.h2_keine_nachteile}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_keine_nachteile} />

            <h2>{content.h2_haftungsausschluss}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_haftungsausschluss} />

            <h2>{content.h2_transparenz_vertrauen}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_transparenz_vertrauen} />
          </article>
        </>
      )}
    </main>
  );
};

export default AffiliateMarketing;
