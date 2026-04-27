// src/components/content/textbild2/sport_hobby2.jsx

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

// Die NEUE, smarte Werbungskomponente (Pfad ggf. anpassen auf z.B. '../../../werbung/werbung.jsx')
import Werbung from '../werbung/werbung.jsx';

// --- HILFSFUNKTIONEN ---

const getBaseLangKey = (langCode) => {
    const code = langCode?.split('-')[0] || 'de';
    // Mapping der Sprachcodes auf Strapi-Feldnamen
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

// 3. Name extrahieren
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
    // Fallback auf "Name2" oder "Name"
    return localizedName || attrs.Name2 || attrs.name2 || attrs.Name || attrs.name || 'Textbild2';
};

// --- SICHERHEITSFUNKTION ---
const stripFrameWrapper = (html) => {
    if (!html || typeof html !== 'string') return "";
    let clean = html.replace(/<div\s+class=["']frame["'][^>]*>/i, "");
    clean = clean.replace(/<\/div>\s*$/, "");
    return clean;
};

// 5. Inhalt aus Item extrahieren
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

// --- ANIMATION PLAYER (Verwendet jetzt ConsoleTextbild2) ---
const SmsAnimation = ({ item, baseLangKey }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { i18n } = useTranslation();
    
    if (!item) return <div>{i18n.t('sport_hobby2.default_message') || "Kein Bild ausgewählt."}</div>;

    const attrs = item.attributes || item;
    const gruppe = attrs.Textfeldgruppe2 || attrs.textfeldgruppe2 || attrs.Textfeldgruppe || attrs.textfeldgruppe || [];
    
    // Frames extrahieren
    const frames = gruppe.map(frameItem => {
        const keysToTry = [
            baseLangKey,                                      
            baseLangKey.toLowerCase(),                
            'ASCII_Frame',                            
            'ascii_frame',                            
            'Sprachen_Frame_Deutsch',                 
            'sprachen_frame_deutsch'
        ];
        let content = '';
        for (const key of keysToTry) {
            if (frameItem[key] && typeof frameItem[key] === 'string' && frameItem[key].trim().length > 0) {
                content = frameItem[key];
                break; 
            }
        }
        return stripFrameWrapper(content);
    }).filter(c => c && c.trim() !== ''); 

    useEffect(() => {
        setActiveIndex(0);
    }, [item.id, item.documentId]);

    // Steuerfunktionen für Console
    const handleNext = () => {
        if (activeIndex < frames.length - 1) setActiveIndex(prev => prev + 1);
    };

    const handleBack = () => {
        if (activeIndex > 0) setActiveIndex(prev => prev - 1);
    };

    const handleReset = () => setActiveIndex(0);

    if (frames.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ff6b6b' }}>
                <p>Keine Frames für die aktuelle Sprache gefunden.</p>
            </div>
        );
    }

    const itemName = getItemName(item, getNameFieldKey(i18n.language));

    return (
        <figure className="textbild2">
            <div className="display deselect">
                {frames.map((content, i) => {
                    const isVisible = i === activeIndex;
                    return (
                        <div 
                            key={i} 
                            className={`frame ${isVisible ? 'show' : ''}`}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                        />
                    );
                })}
            </div>
            
            <figcaption>
                {/* CONSOLE KOMPONENTE EINGEFÜGT */}
                <ConsoleTextbild2 
                    onNext={handleNext}
                    onBack={handleBack}
                    onStart={handleReset}
                    activeIndex={activeIndex}
                    totalFrames={frames.length}
                />
                <a className="vorschau_name">{itemName}</a>
            </figcaption>
        </figure>
    );
};

// --- HAUPTKOMPONENTE ---
const SportHobby2 = () => {
    const { t, i18n } = useTranslation();
    const [country, setCountry] = useState('CH'); // Fallback initial auf CH
    const [loading, setLoading] = useState(true);
    const [apiData, setApiData] = useState([]);
    
    const navigate = useNavigate();
    const { displayId } = useParams(); 

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Eigener IP Check (MaxMind via Strapi)
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
                
                const allData = json.data || [];
                
                // --- FILTERUNG: Nur 'sport_hobby2' ---
                const filtered = allData.filter(item => {
                    try {
                        if (!item) return false;
                        const attrs = item.attributes || item;
                        
                        let rawCategories = 
                            attrs.textbild_2_kategorie?.data || 
                            attrs.textbild2_kategorie?.data || 
                            attrs.Textbild2_kategorie?.data || 
                            attrs.textbild2Kategorie || 
                            attrs.textbild2_kategories?.data; 

                        if (!rawCategories && attrs.textbild2_kategorie) rawCategories = attrs.textbild2_kategorie;
                        if (rawCategories && rawCategories.data) rawCategories = rawCategories.data;
                        
                        if (!rawCategories) return false;
                        
                        const catArray = Array.isArray(rawCategories) ? rawCategories : [rawCategories];
                        
                        return catArray.some(c => {
                            if(!c) return false;
                            const slug = c.attributes?.Slug || c.Slug || c.slug;
                            return slug === 'sport_hobby2';
                        });
                    } catch (err) {
                        return false;
                    }
                });

                setApiData(filtered);

            } catch (error) {
                if (error.name !== 'AbortError') console.error('Error:', error);
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


    // --- 3. AKTIVES BILD ---
    let activeItem = null;
    
    // Link2 bevorzugen
    const currentTargetId = displayId || (apiData.length > 0 ? (apiData[0].attributes?.Link2 || apiData[0].Link2 || apiData[0].attributes?.Link || apiData[0].Link || apiData[0].id) : null);

    if (currentTargetId && apiData.length > 0) {
        activeItem = apiData.find(item => {
            const attrs = item.attributes || item;
            const link = attrs.Link2 || attrs.link2 || attrs.Link || attrs.link || item.id;
            return String(link) === String(currentTargetId);
        });
    }


    // --- 4. LISTE FÜR GALERIE ---
    const allVorschauComponents = apiData.map((item) => {
        try {
            const attrs = item.attributes || item; 
            
            const rawContent = getItemContent(item, baseLangKey);
            if (!rawContent || rawContent.trim().length === 0) return null; 

            const strippedContent = stripFrameWrapper(rawContent);
            const sanitizedContent = DOMPurify.sanitize(strippedContent);
            const finalName = getItemName(item, nameFieldKey);

            // Link bauen: Relativ zu sport_hobby2
            const categorySlug = 'sport_hobby2'; 
            const itemSlug = attrs.Link2 || attrs.link2 || attrs.Link || attrs.link || item.id || item.documentId;

            return (
                <figure key={item.id || item.documentId} className="vorschau_textbild2">
                      <div className="display deselect">
                        <div className="frame" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                      </div>
                      <figcaption>
                        <Link to={`/textbild2/${categorySlug}/${itemSlug}`} className="vorschau_name">
                            {finalName}
                        </Link>
                      </figcaption>
                </figure>
            );
        } catch (renderErr) {
            console.error("Fehler beim Rendern:", renderErr);
            return null;
        }
    });

    const validComponents = allVorschauComponents.filter(c => c !== null);
    
    // Pagination
    const getPaginatedItems = (components, page, perPage) => {
        const start = (page - 1) * perPage;
        return components.slice(start, start + perPage);
    };

    const currentItems = getPaginatedItems(validComponents, currentPage, itemsPerPage);
    const totalPages = Math.ceil(validComponents.length / itemsPerPage);
    const paginate = (num) => setCurrentPage(num);


    return (
        <div className="sport_hobby2">

            {/* Die smarte Werbungskomponente */}
            <Werbung userCountry={country} />

            {/* --- DISPLAY AREA (Animation) --- */}
            <div className="display_area zoom-in">
                {activeItem ? (
                    <SmsAnimation item={activeItem} baseLangKey={baseLangKey} />
                ) : (
                    <div>{t('sport_hobby2.default_message') || "Bitte wähle ein Bild aus."}</div>
                )}
            </div>
            
            <h1>{t('sport_hobby2.title')}</h1>

            {/* --- VORSCHAU GALERIE --- */}
            <div className="vorschau_gallery_textbild2 zoom-in">
                {currentItems.length > 0 ? currentItems : <p style={{textAlign:'center'}}>Keine Elemente gefunden.</p>}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&laquo; Zurück</button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button key={index + 1} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Weiter &raquo;</button>
                </div>
            )}
            
        </div>
    );
}

export default SportHobby2;