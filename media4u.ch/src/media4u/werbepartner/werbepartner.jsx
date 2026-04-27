// src/components/pages/Werbepartner.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const ENDPOINT = 'media4u-werbepartner';

// --- Fallback-Bilder (wenn Strapi kein Media liefert) ---
const FALLBACK_IMG = {
  reichweite:        'https://cms.media4u.ch/uploads/media4u_werbepartner_bild_1_89c7f0bfa1.jpg',
  webseite_werben:   'https://cms.media4u.ch/uploads/media4u_werbepartner_bild_2_26e0cd18e6.jpg',
  preisgestaltung:   'https://cms.media4u.ch/uploads/media4u_werbepartner_bild_3_e7af3c6589.jpg',
  was_ich_benoetige: 'https://cms.media4u.ch/uploads/media4u_werbepartner_bild_4_a4dec6e1f8.jpg',
  ihre_sicherheit:   'https://cms.media4u.ch/uploads/media4u_werbepartner_bild_5_f0d20cfec8.jpg',
  naechsten_schritt: 'https://cms.media4u.ch/uploads/media4u_werbepartner_bild_6_f05ca974c8.jpg',
};

// --- In-Memory Cache pro Session ---
const contentCache = new Map();

// --- Media helper (mit optionaler Fallback-URL) ---
function mediaToSrcAlt(mediaNode, fallbackAlt = '', fallbackUrl = null) {
  const atts = mediaNode?.data?.attributes ?? mediaNode?.attributes ?? null;
  const base = import.meta.env.VITE_STRAPI_URL?.replace(/\/+$/, '') || '';
  const url = atts?.url
    ? (atts.url.startsWith('http') ? atts.url : `${base}${atts.url}`)
    : null;
  const src = url || fallbackUrl || null;
  const alt = atts?.alternativeText || fallbackAlt || '';
  return { src, alt };
}

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
      title: root.h1_title ?? '',

      h2_reichweite: root.h2_reichweite ?? '',
      p_reichweite: root.p_reichweite ?? '',
      img_reichweite: mediaToSrcAlt(root.reichweite, '', FALLBACK_IMG.reichweite),

      h2_webseite_werben: root.h2_webseite_werben ?? '',
      ul_webseite_werben: root.ul_webseite_werben ?? '',
      img_webseite_werben: mediaToSrcAlt(root.webseite_werben, '', FALLBACK_IMG.webseite_werben),

      h2_wichtige_information: root.h2_wichtige_information ?? '',
      p_wichtige_information_1: root.p_wichtige_information_1 ?? '',
      p_wichtige_information_2: root.p_wichtige_information_2 ?? '',

      h2_preisgestaltung: root.h2_preisgestaltung ?? '',
      ul_preisgestaltung: root.ul_preisgestaltung ?? '',
      img_preisgestaltung: mediaToSrcAlt(root.preisgestaltung, '', FALLBACK_IMG.preisgestaltung),

      h2_was_ich_benoetige: root.h2_was_ich_benoetige ?? '',
      ul_was_ich_benoetige: root.ul_was_ich_benoetige ?? '',
      img_was_ich_benoetige: mediaToSrcAlt(root.was_ich_benoetige, '', FALLBACK_IMG.was_ich_benoetige),

      h2_ihre_sicherheit: root.h2_ihre_sicherheit ?? '',
      p_ihre_sicherheit: root.p_ihre_sicherheit ?? '',
      img_ihre_sicherheit: mediaToSrcAlt(root.ihre_sicherheit, '', FALLBACK_IMG.ihre_sicherheit),

      h2_naechsten_schritt: root.h2_naechsten_schritt ?? '',
      p_naechsten_schritt: root.p_naechsten_schritt ?? '',
      img_naechsten_schritt: mediaToSrcAlt(root.naechsten_schritt, '', FALLBACK_IMG.naechsten_schritt),

      h2_interesse_geweckt: root.h2_interesse_geweckt ?? '',
      p_interesse_geweckt: root.p_interesse_geweckt ?? '',
    };
  }
}

/** Sanitization */
function sanitizeFields(obj, htmlFields) {
  const out = {};
  const toSafe = (html) => ({ __html: sanitizeHtml(html || '') });
  for (const key of htmlFields) out[key] = toSafe(obj?.[key]);
  return out;
}

/** Fetch-Hook mit AbortController */
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
          if (res.status === 401 || 403) msg = 'Nicht autorisiert, prüfe Public Permissions.';
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

const Werbepartner = () => {
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
      'ul_webseite_werben',
      'ul_preisgestaltung',
      'ul_was_ich_benoetige',
      'p_reichweite',
      'p_wichtige_information_1',
      'p_wichtige_information_2',
      'p_ihre_sicherheit',
      'p_naechsten_schritt',
      'p_interesse_geweckt',
    ],
    []
  );
  const sanitized = useMemo(() => (content ? sanitizeFields(content, htmlFields) : {}), [content, htmlFields]);

  return (
    <main className="werbepartner-page" aria-busy={loading ? 'true' : 'false'} aria-live="polite">
      <DynamicSEO page="werbepartner" lang={lang} />

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
          </header>

          <article>
            <section>
              <h2>{content.h2_reichweite}</h2>
              <p dangerouslySetInnerHTML={sanitized.p_reichweite} />
              {content.img_reichweite.src && (
                <figure className="figure">
                  <img
                    src={content.img_reichweite.src}
                    alt={content.img_reichweite.alt || content.h2_reichweite}
                    className="responsive-image zoom-in"
                    loading="lazy"
                  />
                </figure>
              )}
            </section>

            <section>
              <h2>{content.h2_webseite_werben}</h2>
              <ul className="bullet-list" dangerouslySetInnerHTML={sanitized.ul_webseite_werben} />
              {content.img_webseite_werben.src && (
                <figure className="figure">
                  <img
                    src={content.img_webseite_werben.src}
                    alt={content.img_webseite_werben.alt || content.h2_webseite_werben}
                    className="responsive-image zoom-in"
                    loading="lazy"
                  />
                </figure>
              )}
            </section>

            <section>
              <h2>{content.h2_wichtige_information}</h2>
              <p dangerouslySetInnerHTML={sanitized.p_wichtige_information_1} />
              <p dangerouslySetInnerHTML={sanitized.p_wichtige_information_2} />
            </section>

            <section>
              <h2>{content.h2_preisgestaltung}</h2>
              <ul className="bullet-list" dangerouslySetInnerHTML={sanitized.ul_preisgestaltung} />
              {content.img_preisgestaltung.src && (
                <figure className="figure">
                  <img
                    src={content.img_preisgestaltung.src}
                    alt={content.img_preisgestaltung.alt || content.h2_preisgestaltung}
                    className="responsive-image zoom-in"
                    loading="lazy"
                  />
                </figure>
              )}
            </section>

            <section>
              <h2>{content.h2_was_ich_benoetige}</h2>
              <ul className="bullet-list" dangerouslySetInnerHTML={sanitized.ul_was_ich_benoetige} />
              {content.img_was_ich_benoetige.src && (
                <figure className="figure">
                  <img
                    src={content.img_was_ich_benoetige.src}
                    alt={content.img_was_ich_benoetige.alt || content.h2_was_ich_benoetige}
                    className="responsive-image zoom-in"
                    loading="lazy"
                  />
                </figure>
              )}
            </section>

            <section>
              <h2>{content.h2_ihre_sicherheit}</h2>
              <p dangerouslySetInnerHTML={sanitized.p_ihre_sicherheit} />
              {content.img_ihre_sicherheit.src && (
                <figure className="figure">
                  <img
                    src={content.img_ihre_sicherheit.src}
                    alt={content.img_ihre_sicherheit.alt || content.h2_ihre_sicherheit}
                    className="responsive-image zoom-in"
                    loading="lazy"
                  />
                </figure>
              )}
            </section>

            <section>
              <h2>{content.h2_naechsten_schritt}</h2>
              <p dangerouslySetInnerHTML={sanitized.p_naechsten_schritt} />
              {content.img_naechsten_schritt.src && (
                <figure className="figure">
                  <img
                    src={content.img_naechsten_schritt.src}
                    alt={content.img_naechsten_schritt.alt || content.h2_naechsten_schritt}
                    className="responsive-image zoom-in"
                    loading="lazy"
                  />
                </figure>
              )}
            </section>

            <section role="region" aria-labelledby="interest-heading">
              <h2 id="interest-heading">{content.h2_interesse_geweckt}</h2>
              <p dangerouslySetInnerHTML={sanitized.p_interesse_geweckt} />
            </section>
          </article>
        </>
      )}
    </main>
  );
};

export default Werbepartner;
