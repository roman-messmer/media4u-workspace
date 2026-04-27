// src/sms_textbild/liebe_freundschaft.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// CSS Imports
import "../css/sms_textbild.css";
import "../css/vorschau_sms_textbild.css";
import "../module/console_sms_textbild/console_sms_textbild.css"; 
import "../css/ZoomIn.css";

// Eigene Komponenten & Hooks
import { useVisibilityObserver } from '../script/useVisibilityObserver';
import Werbung from '../werbung/werbung.jsx';
import SmsConsole from '../module/console_sms_textbild/console_sms_textbild.jsx';

// --- 1. HILFSFUNKTIONEN (Zentralisiert & Wartbar) ---

const getLanguageSuffix = (langCode) => {
    const code = langCode?.split('-')[0] || 'de';
    const mapping = {
        en: 'Englisch', fr: 'Franzoesisch', it: 'Italienisch', es: 'Spanisch', pt: 'Portugisisch',
        ru: 'Russisch', ja: 'Japanisch', ko: 'Koreanisch', zh: 'Chinesisch', nl: 'Niederlaendisch',
        vi: 'Vietnamesisch', th: 'Thailaendisch', sv: 'Schwedisch', pl: 'Polnisch', cs: 'Tschechisch',
        hu: 'Ungarisch', ro: 'Rumaenisch', bg: 'Bulgarisch', fil: 'Filipino', id: 'Indonesisch',
        ms: 'Malaysisch', hi: 'Hindi', tr: 'Tuerkisch'
    };
    return mapping[code] || 'Deutsch';
};

const getBaseLangKey = (lang) => `Sprachen_Frame_${getLanguageSuffix(lang)}`;
const getNameFieldKey = (lang) => `Name_Preview_${getLanguageSuffix(lang)}`;

const stripFrameWrapper = (html) => html?.replace(/<div\s+class=["']frame["'][^>]*>/i, "")?.replace(/<\/div>\s*$/, "") || "";

const getItemName = (item, nameFieldKey) => {
    const attrs = item?.attributes || item || {};
    const nameComp = attrs.Name_Preview || attrs.name_preview;
    if (nameComp) {
        const data = Array.isArray(nameComp) ? nameComp[0] : nameComp;
        const keys = [nameFieldKey, nameFieldKey.toLowerCase(), 'Name_Preview_Deutsch', 'name_preview_deutsch'];
        for (const k of keys) { if (data?.[k]?.trim()) return data[k]; }
    }
    return attrs.Name || attrs.name || 'Textbild';
};

// --- 2. SUB-KOMPONENTE: Animation Player ---
const SmsAnimation = ({ item, baseLangKey }) => {
    const { i18n } = useTranslation();
    const displayRef = useRef(null);
    
    const attrs = item?.attributes || item || {};
    const gruppe = attrs.Textfeldgruppe || attrs.textfeldgruppe || [];
    
    const frames = useMemo(() => {
        return gruppe.map(frameItem => {
            const keys = [baseLangKey, baseLangKey.toLowerCase(), 'ASCII_Frame', 'ascii_frame', 'Sprachen_Frame_Deutsch', 'sprachen_frame_deutsch'];
            for (const k of keys) { if (frameItem?.[k]?.trim()) return stripFrameWrapper(frameItem[k]); }
            return '';
        }).filter(Boolean);
    }, [gruppe, baseLangKey]);

    if (!frames.length) return <div className="sms_error">Keine Frames gefunden.</div>;

    return (
        <figure className="sms_textbild">
            <div className="display deselect" ref={displayRef}>
                {frames.map((content, i) => (
                    <div key={i} className="frame" dangerouslySetInnerHTML={{ __html: content }} />
                ))}
            </div>
            <figcaption className="sms_textbild__caption">
                {/* DER TRICK: Wir geben der Konsole die Item-ID als 'key'. 
                  Sobald ein neues Bild gewählt wird, resettet sich die Konsole komplett selbst!
                */}
                <SmsConsole 
                    key={item.id || item.documentId} 
                    displayRef={displayRef} 
                />
                <span className="sms_textbild__name">
                    {getItemName(item, getNameFieldKey(i18n.language))}
                </span>
            </figcaption>
        </figure>
    );
};

// --- 3. HAUPTKOMPONENTE ---
const LiebeFreundschaft = () => {
    const { t, i18n } = useTranslation();
    const { displayId } = useParams();
    const [country, setCountry] = useState('CH');
    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState([]);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const locale = i18n.language.split('-')[0];

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel: Kategorie-Info & Textbilder laden (Slug: liebe_freundschaft)
                const [catRes, itemRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_STRAPI_URL}/api/sms-textbild-kategories?filters[Slug][$eq]=liebe_freundschaft&locale=${locale}`, { signal: controller.signal }),
                    fetch(`${import.meta.env.VITE_STRAPI_URL}/api/sms-textbilds?populate=*&filters[Animation_Status][$eq]=online&filters[sms_textbild_kategorie][Slug][$eq]=liebe_freundschaft&sort[0]=createdAt:desc&pagination[pageSize]=100`, { signal: controller.signal })
                ]);

                const catJson = await catRes.json();
                const itemJson = await itemRes.json();

                if (catJson.data?.[0]) setCategoryInfo(catJson.data[0].attributes || catJson.data[0]);
                setApiData(itemJson.data || []);
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Strapi Fetch Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, [locale]);

    useEffect(() => {
        const cached = sessionStorage.getItem('userCountry');
        if (cached) return setCountry(cached);
        fetch(`${import.meta.env.VITE_STRAPI_URL}/api/get-location`)
            .then(res => res.json())
            .then(data => {
                const code = data.countryCode || 'CH';
                setCountry(code);
                sessionStorage.setItem('userCountry', code);
            }).catch(() => setCountry('CH'));
    }, []);

    // Kugelsicheres Matching für Direktaufrufe
    const activeItem = useMemo(() => {
        if (loading || !apiData.length) return null;
        const searchId = String(displayId || apiData[0]?.attributes?.Link || apiData[0]?.id || "").toLowerCase();
        return apiData.find(item => {
            const attr = item.attributes || item;
            const matches = [attr.Link, attr.link, attr.Slug, attr.slug, item.id, item.documentId].map(v => String(v || "").toLowerCase());
            return matches.includes(searchId);
        });
    }, [apiData, displayId, loading]);

    useVisibilityObserver({ dependencies: [loading, currentPage] });

    if (loading) return <div className="loading_state">Wird geladen...</div>;

    const baseLangKey = getBaseLangKey(i18n.language);
    const nameFieldKey = getNameFieldKey(i18n.language);

    const validItems = apiData.map(item => {
        const attrs = item.attributes || item;
        const gruppe = attrs.Textfeldgruppe || [];
        const previewFrame = gruppe.find(g => g.Preview || g.preview) || gruppe[0];
        if (!previewFrame) return null;

        const keys = [baseLangKey, baseLangKey.toLowerCase(), 'ASCII_Frame', 'ascii_frame', 'Sprachen_Frame_Deutsch', 'sprachen_frame_deutsch'];
        let content = '';
        for (const k of keys) { if (previewFrame[k]?.trim()) { content = previewFrame[k]; break; } }
        if (!content) return null;

        return (
            <figure key={item.id} className="vorschau_sms_textbild">
                <div className="display deselect">
                    <div className="frame" dangerouslySetInnerHTML={{ __html: stripFrameWrapper(content) }} />
                </div>
                <figcaption>
                    <Link to={`/sms_textbild/liebe_freundschaft/${attrs.Link || item.id}`} className="vorschau_name">
                        {getItemName(item, nameFieldKey)}
                    </Link>
                </figcaption>
            </figure>
        );
    }).filter(Boolean);

    const currentItems = validItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(validItems.length / itemsPerPage);

    return (
        <div className="liebe_freundschaft">
            <Werbung userCountry={country} />

            <div className="display_area zoom-in">
                {activeItem ? (
                    <SmsAnimation item={activeItem} baseLangKey={baseLangKey} />
                ) : (
                    <div className="sms_default_message">
                        {categoryInfo?.Beschreibung || categoryInfo?.description || t('liebe_freundschaft.default_message')}
                    </div>
                )}
            </div>
            
            <h1 className="category_title">{categoryInfo?.Name || "Liebe & Freundschaft"}</h1>

            <div className="vorschau_gallery_sms_textbild zoom-in">
                {currentItems.length > 0 ? currentItems : <p>Keine Elemente gefunden.</p>}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&laquo;</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i+1} onClick={() => setCurrentPage(i+1)} className={currentPage === i+1 ? 'active' : ''}>{i+1}</button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&raquo;</button>
                </div>
            )}
        </div>
    );
};

export default LiebeFreundschaft;