// src/components/pages/Media4u.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import "../../css/media4u.css";
import "../../css/ZoomIn.css";

import DynamicSEO from '../../module/DynamicSEO';
import { observeVisibility } from '../../script/observer';
import { sanitizeHtml } from '../../module/utils/sanitizeHtml.js';

const ENDPOINT = 'media4u-media4u';
const contentCache = new Map();

// --- Media-Helfer ---
function mediaToSrcAlt(mediaNode, fallbackAlt = '') {
  const atts = mediaNode?.data?.attributes ?? mediaNode?.attributes ?? null;
  if (!atts) return { src: null, alt: fallbackAlt };
  const base = import.meta.env.VITE_STRAPI_URL?.replace(/\/+$/, '') || '';
  const url = atts.url?.startsWith('http') ? atts.url : `${base}${atts.url || ''}`;
  const alt = atts.alternativeText || fallbackAlt || '';
  return { src: url || null, alt };
}

// --- Content-Auflösung mit Fallback-Bildern ---
function resolveContent(apiResponse) {
  const raw = apiResponse?.data;
  const node = raw?.attributes ?? raw ?? apiResponse ?? {};

  const content = {
    h1_title: node.h1_title ?? '',
    h2_media4u: node.h2_media4u ?? '',
    p_media4u: node.p_media4u ?? '',
    h2_sms_textbild: node.h2_sms_textbild ?? '',
    p_sms_textbild: node.p_sms_textbild ?? '',
    h2_textbild_2_0: node.h2_textbild_2_0 ?? '',
    p_textbild_2_0: node.p_textbild_2_0 ?? '',
    h2_ascii_art_film: node.h2_ascii_art_film ?? '',
    p_ascii_art_film: node.p_ascii_art_film ?? '',
    h2_erlebe_digitale_kunst: node.h2_erlebe_digitale_kunst ?? '',
    p_erlebe_digitale_kunst: node.p_erlebe_digitale_kunst ?? '',
    h2_technologie_trifft_kunst: node.h2_technologie_trifft_kunst ?? '',
    p_technologie_trifft_kunst: node.p_technologie_trifft_kunst ?? '',
    h2_teile_deine_entdeckungen: node.h2_teile_deine_entdeckungen ?? '',
    p_teile_deine_entdeckungen: node.p_teile_deine_entdeckungen ?? '',
    h2_internationale_reichweite: node.h2_internationale_reichweite ?? '',
    p_internationale_reichweite: node.p_internationale_reichweite ?? '',
  };

  const FALLBACKS = {
    media4u: {
      src: 'https://cms.media4u.ch/uploads/media4u_bild_1_1c3e3c1303.jpg',
      alt: content.h2_media4u || 'MEDIA4U – Übersicht',
    },
    sms_textbild: {
      src: 'https://cms.media4u.ch/uploads/sms_textbild_nokia_de4fc2d5de.jpg',
      alt: content.h2_sms_textbild || 'SMS-Textbilder',
    },
    textbild_2_0: {
      src: 'https://cms.media4u.ch/uploads/textbild_2_0_2854efc38c.jpg',
      alt: content.h2_textbild_2_0 || 'Textbild 2.0',
    },
    ascii_art_film: {
      src: 'https://cms.media4u.ch/uploads/media4u_matrix_09e00002e2.jpg',
      alt: content.h2_ascii_art_film || 'ASCII-Art-Film',
    },
    erlebe_digitale_kunst: {
      src: 'https://cms.media4u.ch/uploads/media4u_bild_3_9ec1c87360.jpg',
      alt: content.h2_erlebe_digitale_kunst || 'Erlebe Digitale Kunst',
    },
    technologie_trifft_kunst: {
      src: 'https://cms.media4u.ch/uploads/media4u_technologie_kunst_b_aeb5786299.jpg',
      alt: content.h2_technologie_trifft_kunst || 'Technologie trifft Kunst',
    },
    teile_deine_entdeckungen: {
      src: null, // aktuell ohne Bild
      alt: content.h2_teile_deine_entdeckungen || '',
    },
    internationale_reichweite: {
      src: 'https://cms.media4u.ch/uploads/media4u_bild_2_62b80a3989.jpg',
      alt: content.h2_internationale_reichweite || 'Internationale Reichweite',
    },
  };

  const images = {
    media4u: mediaToSrcAlt(node.media4u, FALLBACKS.media4u.alt),
    sms_textbild: mediaToSrcAlt(node.sms_textbild, FALLBACKS.sms_textbild.alt),
    textbild_2_0: mediaToSrcAlt(node.textbild_2_0, FALLBACKS.textbild_2_0.alt),
    ascii_art_film: mediaToSrcAlt(node.ascii_art_film, FALLBACKS.ascii_art_film.alt),
    erlebe_digitale_kunst: mediaToSrcAlt(node.erlebe_digitale_kunst, FALLBACKS.erlebe_digitale_kunst.alt),
    technologie_trifft_kunst: mediaToSrcAlt(node.technologie_trifft_kunst, FALLBACKS.technologie_trifft_kunst.alt),
    teile_deine_entdeckungen: mediaToSrcAlt(node.teile_deine_entdeckungen, FALLBACKS.teile_deine_entdeckungen.alt),
    internationale_reichweite: mediaToSrcAlt(node.internationale_reichweite, FALLBACKS.internationale_reichweite.alt),
  };

  for (const k of Object.keys(images)) {
    if (!images[k].src && FALLBACKS[k]?.src) {
      images[k] = { src: FALLBACKS[k].src, alt: FALLBACKS[k].alt };
    }
  }

  return { ...content, images };
}

// --- Sanitization ---
function sanitizeFields(obj, htmlFields) {
  const out = {};
  const toSafe = (html) => ({ __html: sanitizeHtml(html || '') });
  for (const key of htmlFields) out[key] = toSafe(obj?.[key]);
  return out;
}

// --- Hook für Strapi-Content ---
function useStrapiContent(endpoint, locale, { timeoutMs = 12000 } = {}) {
  const BASE_URL = import.meta.env.VITE_STRAPI_URL;
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = `${endpoint}::${locale}`;
  const mountedRef = useRef(true);

  const url = useMemo(() => {
    if (!BASE_URL) return null;
    const u = new URL(`/api/${endpoint}`, BASE_URL.replace(/\/+$/, ''));
    u.searchParams.set('locale', locale);
    u.searchParams.set('populate', '*');
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
          if (res.status === 401 || res.status === 403) msg = 'Nicht autorisiert – Public Permissions prüfen.';
          throw new Error(msg);
        }
        const json = await res.json();
        const resolved = resolveContent(json);
        contentCache.set(key, resolved);
        if (mountedRef.current) setState({ data: resolved, loading: false, error: null });
      } catch (err) {
        if (mountedRef.current) {
          setState({
            data: null,
            loading: false,
            error: err.name === 'AbortError' ? 'Zeitüberschreitung/abgebrochen.' : (err.message || 'Unbekannter Fehler.'),
          });
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

const Media4u = () => {
  const { i18n } = useTranslation();
  const lang = i18n?.language?.split('-')[0] || 'de';
  const { data: content, loading, error } = useStrapiContent(ENDPOINT, lang);

  useEffect(() => {
    if (!loading && content) {
      const cleanup = observeVisibility({ once: true });
      return cleanup;
    }
  }, [loading, content]);

  const htmlFields = useMemo(() => [
    'p_media4u', 'p_sms_textbild', 'p_textbild_2_0', 'p_ascii_art_film',
    'p_erlebe_digitale_kunst', 'p_technologie_trifft_kunst',
    'p_teile_deine_entdeckungen', 'p_internationale_reichweite',
  ], []);

  const sanitized = useMemo(
    () => (content ? sanitizeFields(content, htmlFields) : {}),
    [content, htmlFields]
  );

  // vereinfachter Img-Renderer (ohne figcaption)
  const Img = ({ obj }) => {
    if (!obj?.src) return null;
    return (
      <figure className="figure">
        <img
          src={obj.src}
          alt={obj.alt || ''}
          className="responsive-image zoom-in"
          loading="lazy"
        />
      </figure>
    );
  };

  return (
    <main className="media4u" aria-busy={loading ? 'true' : 'false'} aria-live="polite">
      <DynamicSEO page="media4u" lang={lang} />

      {loading && (
        <div role="status" className="status loading">
          <span className="spinner" aria-hidden="true" /> Inhalte werden geladen …
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="status error">
          Fehler beim Laden der Inhalte: {error}
        </div>
      )}

      {!loading && !error && content && (
        <>
          <h1>{content.h1_title}</h1>

          <section>
            <h2>{content.h2_media4u}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_media4u} />
            <Img obj={content.images.media4u} />
          </section>

          <section>
            <h2>{content.h2_sms_textbild}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_sms_textbild} />
            <Img obj={content.images.sms_textbild} />
          </section>

          <section>
            <h2>{content.h2_textbild_2_0}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_textbild_2_0} />
            <Img obj={content.images.textbild_2_0} />
          </section>

          <section>
            <h2>{content.h2_ascii_art_film}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_ascii_art_film} />
            <Img obj={content.images.ascii_art_film} />
          </section>

          <section>
            <h2>{content.h2_erlebe_digitale_kunst}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_erlebe_digitale_kunst} />
            <Img obj={content.images.erlebe_digitale_kunst} />
          </section>

          <section>
            <h2>{content.h2_technologie_trifft_kunst}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_technologie_trifft_kunst} />
            <Img obj={content.images.technologie_trifft_kunst} />
          </section>

          <section>
            <h2>{content.h2_teile_deine_entdeckungen}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_teile_deine_entdeckungen} />
            <Img obj={content.images.teile_deine_entdeckungen} />
          </section>

          <section>
            <h2>{content.h2_internationale_reichweite}</h2>
            <p dangerouslySetInnerHTML={sanitized.p_internationale_reichweite} />
            <Img obj={content.images.internationale_reichweite} />
          </section>
        </>
      )}
    </main>
  );
};

export default Media4u;
