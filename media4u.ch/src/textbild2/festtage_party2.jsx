// src/components/content/textbild2/festtage_party2.jsx

import { useParams, useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

// CSS Imports
import "../css/vorschau_textbild2.css";
import "../css/ZoomIn.css";

// Hooks
import { useVisibilityObserver } from '../script/useVisibilityObserver';

// --- NEUE CONSOLE IMPORTIEREN ---
import ConsoleTextbild2 from '../module/console_textbild2/console_textbild2.jsx';

// Die NEUE, smarte Werbungskomponente
import Werbung from '../werbung/werbung.jsx';

// --- HILFSFUNKTIONEN ---

const getBaseLangKey = (langCode) => {
    const code = langCode?.split('-')[0] || 'de';
    const mapping = {
        de: 'Sprachen_Frame_Deutsch', en: 'Sprachen_Frame_Englisch', fr: 'Sprachen_Frame_Franzoesisch',
        it: 'Sprachen_Frame_Italienisch', es: 'Sprachen_Frame_Spanisch', pt: 'Sprachen_Frame_Portugisisch',
        ru: 'Sprachen_Frame_Russisch', ja: 'Sprachen_Frame_Japanisch', ko: 'Sprachen_Frame_Koreanisch',
        zh: 'Sprachen_Frame_Chinesisch', nl: 'Sprachen_Frame_Niederlaendisch', vi: 'Sprachen_Frame_Vietnamesisch',
        th: 'Sprachen_Frame_Thailaendisch', sv: 'Sprachen_Frame_Schwedisch', pl: 'Sprachen_Frame_Polnisch',
        cs: 'Sprachen_Frame_Tschechisch', hu: 'Sprachen_Frame_Ungarisch', ro: 'Sprachen_Frame_Rumaenisch',
        bg: 'Sprachen_Frame_Bulgarisch', fil: 'Sprachen_Frame_Filipino', id: 'Sprachen_Frame_Indonesisch',
        ms: 'Sprachen_Frame_Malaysisch', hi: 'Sprachen_Frame_Hindi', tr: 'Sprachen_Frame_Tuerkisch'
    };
    return mapping[code] || 'Sprachen_Frame_Deutsch';
};

const getNameFieldKey = (langCode) => {
    const code = langCode?.split('-')[0] || 'de';
    const mapping = {
        de: 'Name_Preview_Deutsch', en: 'Name_Preview_Englisch', fr: 'Name_Preview_Franzoesisch',
        it: 'Name_Preview_Italienisch', es: 'Name_Preview_Spanisch', pt: 'Name_Preview_Portugisisch',
        ru: 'Name_Preview_Russisch', ja: 'Name_Preview_Japanisch', ko: 'Name_Preview_Koreanisch',
        zh: 'Name_Preview_Chinesisch', nl: 'Name_Preview_Niederlaendisch', vi: 'Name_Preview_Vietnamesisch',
        th: 'Name_Preview_Thailaendisch', sv: 'Name_Preview_Schwedisch', pl: 'Name_Preview_Polnisch',
        cs: 'Name_Preview_Tschechisch', hu: 'Name_Preview_Ungarisch', ro: 'Name_Preview_Rumaenisch',
        bg: 'Name_Preview_Bulgarisch', fil: 'Name_Preview_Filipino', id: 'Name_Preview_Indonesisch',
        ms: 'Name_Preview_Malaysisch', hi: 'Name_Preview_Hindi', tr: 'Name_Preview_Tuerkisch'
    };
    return mapping[code] || 'Name_Preview_Deutsch';
};

const getItemName = (item, nameFieldKey) => {
    const attrs = item.attributes || item; 
    const nameComp = attrs.Name_Preview2 || attrs.name_preview2 || attrs.Name_Preview || attrs.name_preview; 
    let localizedName = '';
    
    if (nameComp) {
        const compData = Array.isArray(nameComp) ? nameComp[0] : nameComp;
        const possibleKeys = [nameFieldKey, nameFieldKey.toLowerCase(), 'Name_Preview_Deutsch', 'name_preview_deutsch'];
        for (const key of possibleKeys) {
            if (compData && compData[key] && typeof compData[key] === 'string' && compData[key].trim().length > 0) {
                localizedName = compData[key];
                break;
            }
        }
    }
    return localizedName || attrs.Name2 || attrs.name2 || attrs.Name || attrs.name || 'Textbild2';
};

const stripFrameWrapper = (html) => {
    if (!html || typeof html !== 'string') return "";
    let clean = html.replace(/<div\s+class=["']frame["'][^>]*>/i, "");
    clean = clean.replace(/<\/div>\s*$/, "");
    return clean;
};

const getItemContent = (item, baseLangKey) => {
    try {
        const attrs = item.attributes || item;
        const gruppe = attrs.Textfeldgruppe2 || attrs.textfeldgruppe2 || attrs.Textfeldgruppe || attrs.textfeldgruppe;
        if (!gruppe || !Array.isArray(gruppe) || gruppe.length === 0) return null;
        let previewItem = gruppe.find(g => g.Preview === true || g.preview === true) || gruppe[0];
        const keysToTry = [baseLangKey, baseLangKey.toLowerCase(), 'ASCII_Frame', 'ascii_frame', 'Sprachen_Frame_Deutsch', 'sprachen_frame_deutsch'];
        let rawContent = '';
        for (const key of keysToTry) {
            const val = previewItem[key];
            if (val && typeof val === 'string' && val.trim().length > 0) {
                rawContent = val;
                break; 
            }
        }
        return rawContent;
    } catch (e) {
        console.error("Fehler beim Extrahieren des Inhalts:", e);
        return null;
    }
};

const SmsAnimation = ({ item, baseLangKey }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { i18n } = useTranslation();
    if (!item) return <div>{i18n.t('festtage_party2.default_message') || "Kein Bild ausgewählt."}</div>;
    const attrs = item.attributes || item;
    const gruppe = attrs.Textfeldgruppe2 || attrs.textfeldgruppe2 || attrs.Textfeldgruppe || attrs.textfeldgruppe || [];
    const frames = gruppe.map(frameItem => {
        const keysToTry = [baseLangKey, baseLangKey.toLowerCase(), 'ASCII_Frame', 'ascii_frame', 'Sprachen_Frame_Deutsch', 'sprachen_frame_deutsch'];
        let content = '';
        for (const key of keysToTry) {
            if (frameItem[key] && typeof frameItem[key] === 'string' && frameItem[key].trim().length > 0) {
                content = frameItem[key];
                break; 
            }
        }
        return stripFrameWrapper(content);
    }).filter(c => c && c.trim() !== ''); 

    useEffect(() => { setActiveIndex(0); }, [item.id, item.documentId]);

    const handleNext = () => { if (activeIndex < frames.length - 1) setActiveIndex(prev => prev + 1); };
    const handleBack = () => { if (activeIndex > 0) setActiveIndex(prev => prev - 1); };
    const handleReset = () => setActiveIndex(0);

    if (frames.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#ff6b6b' }}><p>Keine Frames gefunden.</p></div>;
    const itemName = getItemName(item, getNameFieldKey(i18n.language));

    return (
        <figure className="textbild2">
            <div className="display deselect">
                {frames.map((content, i) => (
                    <div key={i} className={`frame ${i === activeIndex ? 'show' : ''}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
                ))}
            </div>
            <figcaption>
                <ConsoleTextbild2 onNext={handleNext} onBack={handleBack} onStart={handleReset} activeIndex={activeIndex} totalFrames={frames.length} />
                <a className="vorschau_name">{itemName}</a>
            </figcaption>
        </figure>
    );
};

const FesttageParty2 = () => {
    const { t, i18n } = useTranslation();
    const [country, setCountry] = useState('CH');
    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState([]);
    const { displayId } = useParams(); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchCountry = async () => {
            const cachedCountry = sessionStorage.getItem('userCountry');
            if (cachedCountry) { setCountry(cachedCountry); return; }
            try {
                const response = await fetch(`${import.meta.env.VITE_STRAPI_URL}/api/get-location`);
                if (response.ok) {
                    const data = await response.json();
                    const code = data.countryCode || 'CH';
                    sessionStorage.setItem('userCountry', code);
                    setCountry(code);
                } else { setCountry('CH'); }
            } catch { setCountry('CH'); }
        };
        fetchCountry();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const fetchSmsTextbilder = async () => {
            try {
                const queryParams = new URLSearchParams({
                    'populate': '*',
                    'sort[0]': 'createdAt:desc', 
                    'pagination[pageSize]': '100', 
                    'filters[Animation_Status2][$eq]': 'online' 
                });
                const response = await fetch(`${import.meta.env.VITE_STRAPI_URL}/api/textbild2s?${queryParams.toString()}`, { signal: controller.signal });
                if (!response.ok) throw new Error('Strapi API Error');
                const json = await response.json();
                const allData = json.data || [];
                const filtered = allData.filter(item => {
                    const attrs = item.attributes || item;
                    let cats = attrs.textbild_2_kategorie?.data || attrs.textbild2_kategorie?.data || attrs.Textbild2_kategorie?.data || attrs.textbild2Kategorie || attrs.textbild2_kategories?.data; 
                    if (!cats && attrs.textbild2_kategorie) cats = attrs.textbild2_kategorie;
                    const catArray = Array.isArray(cats) ? cats : (cats?.data ? cats.data : []);
                    return catArray.some(c => (c.attributes?.Slug || c.Slug || c.slug) === 'festtage_party2');
                });
                setApiData(filtered);
            } catch (error) { if (error.name !== 'AbortError') console.error('Error:', error); }
            finally { setLoading(false); }
        };
        fetchSmsTextbilder();
        return () => controller.abort();
    }, []);

    useVisibilityObserver({ dependencies: [loading, currentPage] });
    if (loading) return <div>Loading...</div>;

    const baseLangKey = getBaseLangKey(i18n.language);
    const nameFieldKey = getNameFieldKey(i18n.language);

    let activeItem = apiData.find(item => {
        const attrs = item.attributes || item;
        const link = attrs.Link2 || attrs.link2 || attrs.Link || attrs.link || item.id;
        return String(link) === String(displayId || (apiData[0]?.attributes?.Link2 || apiData[0]?.Link2 || apiData[0]?.id));
    });

    const allVorschauComponents = apiData.map((item) => {
        const attrs = item.attributes || item; 
        const rawContent = getItemContent(item, baseLangKey);
        if (!rawContent || rawContent.trim().length === 0) return null; 
        const sanitizedContent = DOMPurify.sanitize(stripFrameWrapper(rawContent));
        const finalName = getItemName(item, nameFieldKey);
        const itemSlug = attrs.Link2 || attrs.link2 || attrs.Link || attrs.link || item.id;

        return (
            <figure key={item.id || item.documentId} className="vorschau_textbild2">
                  <div className="display deselect">
                    <div className="frame" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                  </div>
                  <figcaption>
                    <Link to={`/textbild2/festtage_party2/${itemSlug}`} className="vorschau_name">{finalName}</Link>
                  </figcaption>
            </figure>
        );
    }).filter(c => c !== null);

    const currentItems = allVorschauComponents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(allVorschauComponents.length / itemsPerPage);

    return (
        <div className="festtage_party2">
            <Werbung userCountry={country} />
            <div className="display_area zoom-in">
                <SmsAnimation item={activeItem} baseLangKey={baseLangKey} />
            </div>
            <h1>{t('festtage_party2.title')}</h1>
            <div className="vorschau_gallery_textbild2 zoom-in">
                {currentItems.length > 0 ? currentItems : <p style={{textAlign:'center'}}>Keine Elemente gefunden.</p>}
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>&laquo; Zurück</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Weiter &raquo;</button>
                </div>
            )}
        </div>
    );
}

export default FesttageParty2;