// src/components/ProjectsBlock.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from '../utils/sanitizeHtml';
import '../components/projects_block.css'; // scoped CSS

// Resiliente Extraktion + Fallback-Struktur
function resolveContent(data){
  // Erwartet { items: [ { id, title, html, href, image, tags[] } ] }
  // Erlaubt auch plain Array als Fallback:
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return Array.isArray(items) ? items : [];
}

/**
 * Lädt statische Projekt-Daten aus /public/content/projects.<locale>.json
 * – berücksichtigt i18n.language?.split('-')[0] || 'de'
 * – AbortController Cleanup
 * – Fallback-Reihenfolge: <locale> -> 'de' -> ohne Suffix (projects.json)
 * – sanitized HTML-Rendering (keine direkten innerHTMLs)
 */
export default function ProjectsBlock({
  basePath = 'content/projects',   // relativ zu Vite public/
  className = '',
}) {
  const { i18n } = useTranslation();
  const [items, setItems]   = useState([]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const locale = i18n.language?.split('-')[0] || 'de';

    // Vite: Dateien in /public sind unter import.meta.env.BASE_URL erreichbar
    const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/,'');
    const urls = [
      `${BASE}/${basePath}.${encodeURIComponent(locale)}.json`,
      locale !== 'de' ? `${BASE}/${basePath}.de.json` : null,
      `${BASE}/${basePath}.json`
    ].filter(Boolean);

    let done = false;

    async function load(){
      setLoading(true); setError(''); setItems([]);
      for(const url of urls){
        try{
          const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
          if(!res.ok){
            // 404 -> probiere nächste Variante
            if(res.status === 404) continue;
            throw new Error(`${res.status} ${res.statusText}`);
          }
          const json = await res.json();
          const content = resolveContent(json);
          if(!Array.isArray(content) || content.length === 0){
            // leer? nächster Versuch
            continue;
          }
          if(!done){
            setItems(content);
            done = true;
          }
          break;
        } catch(e){
          if(e.name === 'AbortError') return;
          // Netzwerkfehler -> breche Kette ab und zeige Fehler
          setError(e.message);
          break;
        }
      }
      if(!done && !error){
        setError('Keine Projektdaten gefunden (alle Fallbacks durchlaufen).');
      }
      setLoading(false);
    }

    load();
    return () => ctrl.abort();
  }, [i18n.language, basePath]);

  const sanitizedItems = useMemo(() => {
    return items.map(it => ({
      ...it,
      _safeHtml: sanitizeHtml(it.html || ''),
    }));
  }, [items]);

  if(loading){
    return <div className={`proj-status ${className}`} role="status" aria-busy="true">Lade Projekte…</div>;
  }
  if(error){
    return <div className={`proj-error ${className}`} role="alert" aria-live="assertive">Fehler: {error}</div>;
  }

  return (
    <section className={`projects ${className}`} aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="projects__title">Projekte</h2>
      <ul className="projects__list" role="list">
        {sanitizedItems.map(item => (
          <li key={item.id ?? item.href ?? item.title} className="projects__item">
            <article className="projects__card">
              {item.image && (
                <img className="projects__image" src={item.image} alt={item.title || ''} loading="lazy" />
              )}
              <header className="projects__header">
                {item.href ? (
                  <a className="projects__link" href={item.href} target="_blank" rel="noopener noreferrer">
                    <h3 className="projects__name">{item.title}</h3>
                  </a>
                ) : (
                  <h3 className="projects__name">{item.title}</h3>
                )}
              </header>
              <div
                className="projects__desc"
                // HTML kommt nur sanitizt rein
                dangerouslySetInnerHTML={{ __html: item._safeHtml }}
              />
              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <ul className="projects__tags" aria-label="Tags" role="list">
                  {item.tags.map((t, idx) => <li key={idx} className="projects__tag">{t}</li>)}
                </ul>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
