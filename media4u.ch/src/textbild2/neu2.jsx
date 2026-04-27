// ./src/components/content/smstextbild/neu2.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

import "../css/vorschau_textbild2.css";
import "../css/ZoomIn.css";

import { useVisibilityObserver } from '../script/useVisibilityObserver';

// Die NEUE, smarte Werbungskomponente (Pfad ggf. anpassen auf z.B. '../../../werbung/werbung.jsx')
import Werbung from '../werbung/werbung.jsx';

// --- HILFSFUNKTIONEN (Außerhalb der Komponente definiert) ---

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
        const possibleKeys = [
            nameFieldKey, nameFieldKey.toLowerCase(),
            'Name_Preview_Deutsch', 'name_preview_deutsch'
        ];
        for (const key of possibleKeys) {
            if (compData && compData[key] && typeof compData[key] === 'string' && compData[key].trim().length > 0) {
                localizedName = compData[key];
                break;
            }
        }
    }
    return localizedName || attrs.Name2 || attrs.Name || attrs.name || 'Textbild2';
};

const stripFrameWrapper = (html) => {
    if (!html) return "";
    let clean = html.replace(/<div\s+class=["']frame["'][^>]*>/i, "");
    clean = clean.replace(/<\/div>\s*$/, "");
    return clean;
};

// Inhalt aus Item extrahieren (FÜR TEXTBILD 2)
const getItemContent = (item, baseLangKey) => {
    try {
        const attrs = item.attributes || item;
        const gruppe = attrs.Textfeldgruppe2 || attrs.textfeldgruppe2 || attrs.Textfeldgruppe || attrs.textfeldgruppe;
        
        if (!gruppe || !Array.isArray(gruppe) || gruppe.length === 0) return null;

        let previewItem = gruppe.find(g => g.Preview === true || g.preview === true);
        if (!previewItem) previewItem = gruppe[0];

        const keysToTry = [
            baseLangKey,                                      
            baseLangKey.toLowerCase(),                
            'ASCII_Frame',                            
            'ascii_frame',                            
            'Sprachen_Frame_Deutsch',                 
            'sprachen_frame_deutsch'
        ];

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

const Neu2 = () => {
    const { t, i18n } = useTranslation();
    const [country, setCountry] = useState('CH'); // Fallback initial auf CH
    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // 1. Eigener IP Check (MaxMind via Strapi)
    useEffect(() => {
        const fetchCountry = async () => {
            const cachedCountry = sessionStorage.getItem('userCountry');
            if (cachedCountry) {
                setCountry(cachedCountry);
                return;
            }
            try {
                // Lokaler Endpunkt statt ipapi
                const response = await fetch(`${import.meta.env.VITE_STRAPI_URL}/api/get-location`);
                if (response.ok) {
                    const data = await response.json();
                    const code = data.countryCode || 'CH';
                    sessionStorage.setItem('userCountry', code);
                    setCountry(code);
                } else {
                    setCountry('CH');
                }
            } catch (error) {
                console.error("Fehler bei der Lokalisierung:", error);
                setCountry('CH');
            }
        };
        fetchCountry();
    }, []);

    // 2. Fetch Strapi Data (TEXTBILD 2 ENDPOINT)
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchSmsTextbilder = async () => {
            try {
                const queryParams = new URLSearchParams({
                    'populate': '*',
                    'sort[0]': 'createdAt:desc', 
                    'pagination[pageSize]': '100', 
                    'filters[Animation_Status2][$eq]': 'online' 
                });

                const response = await fetch(`${import.meta.env.VITE_STRAPI_URL}/api/textbild2s?${queryParams.toString()}`, { signal });
                if (!response.ok) throw new Error('Strapi API Error');
                const json = await response.json();
                setApiData(json.data || []);
            } catch (error) {
                if (error.name !== 'AbortError') console.error('Fehler beim Laden der Textbilder:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSmsTextbilder();
        return () => controller.abort();
    }, []);

    useVisibilityObserver({ dependencies: [loading, currentPage] });

    if (loading) return <div>Loading...</div>;

    const baseLangKey = getBaseLangKey(i18n.language);
    const nameFieldKey = getNameFieldKey(i18n.language);

    const allVorschauComponents = apiData.map((item) => {
        const attrs = item.attributes || item; 
        
        const rawContent = getItemContent(item, baseLangKey);
        if (!rawContent || rawContent.trim().length === 0) return null; 

        const strippedContent = stripFrameWrapper(rawContent);
        const sanitizedContent = DOMPurify.sanitize(strippedContent);
        const finalName = getItemName(item, nameFieldKey);

        let rawCategories = 
            attrs.textbild2_kategorie?.data || 
            attrs.textbild2_kategories?.data || 
            attrs.textbild2Kategorie || 
            attrs.textbild_2_kategorie?.data ||
            attrs.sms_textbild_kategorie?.data;
            
        if (!rawCategories && attrs.textbild2_kategorie) rawCategories = attrs.textbild2_kategorie;
        if (rawCategories && rawCategories.data) rawCategories = rawCategories.data;

        const firstCategory = Array.isArray(rawCategories) && rawCategories.length > 0 
            ? rawCategories[0] 
            : null;
            
        const categorySlug = firstCategory ? (firstCategory.attributes?.Slug || firstCategory.Slug || firstCategory.slug) : '';
        const itemSlug = attrs.Link2 || attrs.link2 || attrs.Link || attrs.link || item.id || item.documentId;
        
        const linkPath = categorySlug 
            ? `/textbild2/${categorySlug}/${itemSlug}`
            : `/textbild2/${itemSlug}`;

        return (
            <figure key={item.id || item.documentId} className="vorschau_textbild2">
                 <div className="display deselect">
                    <div className="frame" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                 </div>
                 <figcaption>
                    <Link to={linkPath} className="vorschau_name">
                        {finalName}
                    </Link>
                 </figcaption>
            </figure>
        );
    });

    const validVorschauComponents = allVorschauComponents.filter(c => c !== null);
    
    // Pagination
    const getPaginatedItems = (components, page, perPage) => {
        const start = (page - 1) * perPage;
        return components.slice(start, start + perPage);
    };

    const currentItems = getPaginatedItems(validVorschauComponents, currentPage, itemsPerPage);
    const totalPages = Math.ceil(validVorschauComponents.length / itemsPerPage);
    const paginate = (num) => setCurrentPage(num);

    return (
        <>
            {/* Die smarte Werbungskomponente */}
            <Werbung userCountry={country} />

            <h1>{t('neu2.title')}</h1>

            <div className="vorschau_gallery_textbild2 zoom-in">
                {currentItems}
            </div>

            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&laquo; Zurück</button>
                {[...Array(totalPages)].map((_, index) => (
                    <button key={index + 1} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
                        {index + 1}
                    </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Weiter &raquo;</button>
            </div>
        </>
    );
};

export default Neu2;