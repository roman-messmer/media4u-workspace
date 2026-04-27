import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { sanitizeHtml } from '../module/utils/sanitizeHtml';
import useGeoIp from '../module/utils/useGeoIp';
import './werbung.css';

// Prüft, ob der Zeitraum aktuell gültig ist
const isPartnerActive = (card) => {
    const periods = card.attributes?.validityPeriods || card.validityPeriods || [];
    if (!periods || periods.length === 0) return true;
    
    const today = new Date();
    return periods.some(period => {
        if (!period.startDate || !period.endDate) return false;
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        return today >= start && today <= end;
    });
};

// Prüft das Land (Case-Insensitive)
const isCountryMatch = (card, userCountry) => {
    const targets = card.attributes?.targetCountries || card.targetCountries;
    
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
        return true; 
    }

    if (targets.some(t => String(t).toUpperCase() === 'ALL')) {
        return true;
    }

    if (!userCountry) return false;

    const normalizedUser = String(userCountry).trim().toUpperCase();
    return targets.some(t => String(t).trim().toUpperCase() === normalizedUser);
};

// 3. Prüft die Kategorie
const isLocationMatch = (card, currentPath) => {
    const relationField = card.attributes?.werbung_kategories || card.werbung_kategories;
    const kategoriesData = relationField?.data || relationField || [];
    
    const targets = Array.isArray(kategoriesData) 
        ? kategoriesData.map(kat => kat.attributes?.slug || kat.slug).filter(Boolean)
        : [];

    // Wenn 'ALL' eingetragen ist, überall zeigen
    if (targets.some(t => String(t).toUpperCase() === 'ALL')) return true;
    
    // HIER IST DIE ÄNDERUNG: 
    // Wenn in Strapi KEINE Kategorie ausgewählt wurde, 
    // zeigen wir die Werbung standardmäßig auf allen Seiten an.
    if (targets.length === 0) {
        return true; 
    }

    // Prüft auf exakte Übereinstimmung mit der URL (z.B. "neu" oder "neu2")
    const pathSegments = currentPath.toLowerCase().split('/').filter(Boolean);
    return targets.some(target => pathSegments.includes(target.toLowerCase()));
};

const Werbung = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { country, loading: geoLoading, error: geoError } = useGeoIp();

    const [cardsData, setCardsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '' });
    
    const timerRef = useRef(null);

    useEffect(() => {
        if (geoLoading) return;

        const abortController = new AbortController();
        setLoading(true);

        const fetchWerbung = async () => {
            try {
                // DIE LÖSUNG: Sichere Array-Syntax für Strapi v5! 
                // So blockt Strapi die Anfrage nicht mehr ab (verhindert Status 400)
                const url = `${import.meta.env.VITE_STRAPI_URL}/api/werbungs?populate[0]=validityPeriods&populate[1]=werbung_kategories`;
                
                const response = await fetch(url, { signal: abortController.signal });

                if (!response.ok) {
                    // Wenn Strapi immer noch meckert, werfen wir den genauen Fehlertext in die Konsole
                    const errorDetails = await response.text();
                    console.error("Strapi Error Details:", errorDetails);
                    throw new Error(`Status: ${response.status}`);
                }

                const rawData = await response.json();
                const dataArray = rawData.data || [];

                const filteredData = dataArray.filter(card => 
                    isPartnerActive(card) &&
                    isCountryMatch(card, country) && 
                    isLocationMatch(card, location.pathname)
                );

                const priority = filteredData.filter(c => {
                    const type = c.attributes?.cardType || c.cardType;
                    return ['partner', 'support'].includes(String(type).toLowerCase());
                });
                const others = filteredData.filter(c => {
                    const type = c.attributes?.cardType || c.cardType;
                    return !['partner', 'support'].includes(String(type).toLowerCase());
                });

                const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

                const finalSelection = [...priority, ...shuffle(others)].slice(0, 10);
                setCardsData(shuffle(finalSelection));
                
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWerbung();
        return () => abortController.abort();
    }, [geoLoading, country, location.pathname]);

    const handleButtonClick = (e, msg, link, openInNewTab) => {
        if (!openInNewTab) e.preventDefault();
        setToast({ visible: true, message: `${t('werbung.redirecting', 'Weiterleitung')}: ${msg}` });

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
            if (link && !openInNewTab) window.location.href = link;
        }, 2500);
    };

    const getStyles = (type) => {
        const t = String(type).toLowerCase();
        if (t === 'portfolio') return { card: 'card--portfolio', badge: 'card__badge--portfolio', btn: 'button--portfolio' };
        if (t === 'partner') return { card: 'card--sponsored', badge: 'card__badge--ad', btn: 'button--ad' };
        if (t === 'support') return { card: 'card--support', badge: 'card__badge--support', btn: 'button--support' };
        return { card: '', badge: 'card__badge--affiliate', btn: 'button--affiliate' };
    };

    if (loading || geoLoading) return <div className="werbung-wrapper" aria-busy="true"><p>{t('werbung.loading', 'Wird geladen...')}</p></div>;
    // Zeigt den Fehler-Code jetzt auch im Frontend an (z.B. Status 400)
    if (error || geoError) return <div className="werbung-wrapper" role="alert"><p>{t('werbung.error_loading', 'Inhalte konnten nicht geladen werden.')} ({error})</p></div>;

    return (
        <aside className="werbung-wrapper">
            <h1 className="heading zoom-in visible">{t('werbung.title', 'Werbung')}</h1>
            <div className="product-grid" role="list">
                {cardsData.map((card) => {
                    const id = card.id || card.documentId;
                    const cardType = card.attributes?.cardType || card.cardType;
                    const imageUrl = card.attributes?.imageUrl || card.imageUrl;
                    const title = card.attributes?.title || card.title;
                    const description = card.attributes?.description || card.description;
                    const priceDisplay = card.attributes?.priceDisplay || card.priceDisplay;
                    const ratingValue = card.attributes?.ratingValue || card.ratingValue;
                    const reviewCount = card.attributes?.reviewCount || card.reviewCount;
                    const buttonUrl = card.attributes?.buttonUrl || card.buttonUrl;
                    const buttonText = card.attributes?.buttonText || card.buttonText;
                    const company = card.attributes?.company || card.company;
                    const explicitBadgeText = card.attributes?.badgeText || card.badgeText;

                    const styles = getStyles(cardType);
                    const openInNewTab = ['partner', 'affiliate', 'support'].includes(String(cardType).toLowerCase());
                    const badgeText = explicitBadgeText || t(`werbung.badge_${String(cardType).toLowerCase()}`, cardType);

                    return (
                        <article key={id} className={`card ${styles.card}`} role="listitem">
                            <span className={`card__badge ${styles.badge}`}>{badgeText}</span>
                            {imageUrl && (
                                <div className="card__image-wrapper">
                                    <img src={imageUrl} alt={title} className="card__image" loading="lazy" />
                                </div>
                            )}
                            <div className="card__content">
                                <h2 className="card__title" dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }} />
                                {description && <p className="card__description" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />}
                                
                                {(priceDisplay || ratingValue) && (
                                    <div className="card__meta">
                                        {ratingValue && (
                                            <div className="card__rating">
                                                <span className="card__stars">⭐ {ratingValue}</span>
                                                {reviewCount && <span className="card__count">({reviewCount})</span>}
                                            </div>
                                        )}
                                        {priceDisplay && <span className="card__price">{priceDisplay}</span>}
                                    </div>
                                )}

                                <div className="card__footer">
                                    <a href={buttonUrl} className={`button ${styles.btn}`} 
                                       target={openInNewTab ? "_blank" : undefined}
                                       rel={openInNewTab ? "noopener noreferrer" : undefined}
                                       onClick={(e) => handleButtonClick(e, company || title, buttonUrl, openInNewTab)}>
                                        {buttonText || t('werbung.view_offer', 'Ansehen')}
                                    </a>
                                </div>
                            </div>
                        </article>
                    );
                })}
                <figure className="card boxWerbepartnerInfo" role="listitem">
                    <div className="werbepartnerInfo">
                        <h3>{t('werbung.ad_space_title', 'Werbeplatz sichern!')}</h3>
                        <p>{t('werbung.ad_space_desc', 'Präsentieren Sie Ihr Unternehmen international.')}</p>
                    </div>
                    <div className="card__footer" style={{ padding: '0.5rem 1rem 1rem' }}>
                        <a href="/media4u/mehr_info" className="button button--werbeplatz_sichern">
                            {t('werbung.ad_space_btn', 'Jetzt sichern')}
                        </a>
                    </div>
                </figure>
            </div>
            <div id="toast" className={`toast ${toast.visible ? 'toast--visible' : ''}`}>{toast.message}</div>
        </aside>
    );
};

export default Werbung;