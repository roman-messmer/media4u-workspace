// src/components/pages/FrontEndDeveloper.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import '../../css/ZoomIn.css';

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const ENDPOINT = 'media4u-frontend-entwickler';

// --- In-Memory Cache pro Session (endpoint+locale) ---
const contentCache = new Map();

/** Robust gegen Strapi v4 (Single/Collection) & Strukturdrift */
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
      title: root.title ?? '',
      h2_frontend_entwickler: root.h2_frontend_entwickler ?? '',
      p_frontend_entwickler: root.p_frontend_entwickler ?? '',
      h2_fokus: root.h2_fokus ?? '',
      h2_frontend: root.h2_frontend ?? '',
      ul_frontend: root.ul_frontend ?? '',
      h2_content_strategie: root.h2_content_strategie ?? '',
      p_content_strategie: root.p_content_strategie ?? '',
      h2_backend: root.h2_backend ?? '',
      ul_backend: root.ul_backend ?? '',
      h2_architektur_qualitaesanspruch: root.h2_architektur_qualitaesanspruch ?? '',
      ul_practices: root.ul_practices ?? '',
      h2_KI_anwendung: root.h2_KI_anwendung ?? '',
      p_KI_anwendung: root.p_KI_anwendung ?? '',
      ul_KI_anwendung: root.ul_KI_anwendung ?? '',
      h2_anspruch: root.h2_anspruch ?? '',
      p_anspruch_1: root.p_anspruch_1 ?? '',
      p_anspruch_2: root.p_anspruch_2 ?? '',
      h2_perspektiven: root.h2_perspektiven ?? '',
      p_perspektiven_1: root.p_perspektiven_1 ?? '',
      p_perspektiven_2: root.p_perspektiven_2 ?? '',
      h2_partner: root.h2_partner ?? '',
      p_partner: root.p_partner ?? '',
      ul_partner: root.ul_partner ?? '',
      h2_projekte: root.h2_projekte ?? '',
      div_projekte: root.div_projekte ?? '',
      h2_interesse: root.h2_interesse ?? '',
      p_interesse_1: root.p_interesse_1 ?? '',
      p_interesse_2: root.p_interesse_2 ?? '',
      img_alt: root.img_alt ?? 'Media4u – Frontend Entwickler',
    };
  }
}

/** Generische Sanitization */
function sanitizeFields(obj, htmlFields) {
  const out = {};
  const toSafe = (html) => ({ __html: sanitizeHtml(html || '') });
  for (const key of htmlFields) out[key] = toSafe(obj?.[key]);
  return out;
}

/** Reusable Hook für Strapi Content */
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

  const htmlFields = useMemo(
    () => [
      'ul_frontend', 'ul_backend', 'ul_practices', 'ul_partner', 'div_projekte', 'ul_KI_anwendung',
      'p_frontend_entwickler', 'p_anspruch_1', 'p_anspruch_2', 'p_KI_anwendung',
      'p_perspektiven_1', 'p_perspektiven_2', 'p_partner',
      'p_interesse_1', 'p_interesse_2', 'p_content_strategie'
    ],
    []
  );

  const sanitized = useMemo(() => (content ? sanitizeFields(content, htmlFields) : {}), [content, htmlFields]);

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

      {!loading && !error && content && (
        <>
          <header>
            <h1>{content.title}</h1>
            <h2>{content.h2_frontend_entwickler}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_frontend_entwickler} />
          </header>

          <article>
            <h2>{content.h2_fokus}</h2>

            <section>
              <h3>{content.h2_frontend}</h3>
              <ul className="bullet-list tech-icon-list" dangerouslySetInnerHTML={sanitized.ul_frontend} />
            </section>

            <section>
              <h3>{content.h2_content_strategie}</h3>
              <p className="bullet-list tech-icon-list" dangerouslySetInnerHTML={sanitized.p_content_strategie} />
            </section>

            <section>
              <h3>{content.h2_backend}</h3>
              <ul className="bullet-list tech-icon-list" dangerouslySetInnerHTML={sanitized.ul_backend} />
            </section>

            <section>
              <h3>{content.h2_architektur_qualitaesanspruch}</h3>
              <ul className="bullet-list" dangerouslySetInnerHTML={sanitized.ul_practices} />
            </section>

            <figure className="figure">
              <img
                src="https://cms.media4u.ch/uploads/media4u_frontend_developer_bild_1_cd29bc6108.JPG"
                alt={content?.img_alt || 'Media4u – Frontend Entwickler'}
                className="responsive-image zoom-in"
                loading="lazy"
              />
            </figure>

            <section>
              <h3>{content.h2_KI_anwendung}</h3>
              <p dangerouslySetInnerHTML={sanitized.p_KI_anwendung} />
              <ul className="bullet-list" dangerouslySetInnerHTML={sanitized.ul_KI_anwendung} />
            </section>

            <section>
              <h3>{content.h2_anspruch}</h3>
              <p dangerouslySetInnerHTML={sanitized.p_anspruch_1} />
              <p dangerouslySetInnerHTML={sanitized.p_anspruch_2} />
            </section>

            <section>
              <h3>{content.h2_perspektiven}</h3>
              <p dangerouslySetInnerHTML={sanitized.p_perspektiven_1} />
              <p dangerouslySetInnerHTML={sanitized.p_perspektiven_2} />
            </section>

            <section>
              <h3>{content.h2_partner}</h3>
              <p dangerouslySetInnerHTML={sanitized.p_partner} />
              <ul className="bullet-list" dangerouslySetInnerHTML={sanitized.ul_partner} />
            </section>

            <section>
              <h3>{content.h2_projekte}</h3>
              <div className="projekte bullet-list" dangerouslySetInnerHTML={sanitized.div_projekte} />
            </section>

            <section role="region" aria-labelledby="interest-heading">
              <h3 id="interest-heading">{content.h2_interesse}</h3>
              <p dangerouslySetInnerHTML={sanitized.p_interesse_1} />
              <p dangerouslySetInnerHTML={sanitized.p_interesse_2} />
            </section>
          </article>
        </>
      )}
    </main>
  );
};

export default FrontEndDeveloper;
