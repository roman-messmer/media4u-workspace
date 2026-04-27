import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import './mehr_info.css';

const MehrInfo = () => {
    const { t } = useTranslation();
    const [requestType, setRequestType] = useState('premium'); // 'premium' oder 'support'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    
    // Sicherheit: Honeypot State (für Bots unsichtbar)
    const [hpValue, setHpValue] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        configUrl: "",
        backlinkUrl: "",
        message: ""
    });
    
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialisierung des Rate-Limitings aus dem LocalStorage
    useEffect(() => {
        const savedTime = localStorage.getItem('lastAdSubmit');
        if (savedTime) {
            setLastSubmitTime(parseInt(savedTime, 10));
        }
    }, []);

    // XSS Schutz: Eingaben für die Zusammenfassung säubern
    const sanitizedData = useMemo(() => ({
        company: DOMPurify.sanitize(formData.company),
        message: DOMPurify.sanitize(formData.message)
    }), [formData.company, formData.message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Schutz vor extrem langen Eingaben
        if (value.length > 1000) return; 
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. Sicherheit: Honeypot Check (Bots füllen dieses Feld aus)
        if (hpValue !== "") {
            console.warn("Bot-Aktivität erkannt.");
            return; 
        }

        // 2. Sicherheit: Rate Limiting (30 Sek Sperre, persistent)
        const now = Date.now();
        if (now - lastSubmitTime < 30000) {
            alert(t('mehr_info.error_too_many_requests', 'Bitte warten Sie kurz vor der nächsten Anfrage.'));
            return;
        }

        setShowConfirmation(true);
    };

    const sendEmail = () => {
        setIsSubmitting(true);
        const now = Date.now();
        setLastSubmitTime(now);
        localStorage.setItem('lastAdSubmit', now.toString());

        const typeLabel = requestType === 'premium' ? t('mehr_info.type_premium', 'Premium Partner') : t('mehr_info.type_support', 'Support Partner (Backlink)');
        const subject = encodeURIComponent(t('mehr_info.email_subject', 'Anfrage {{type}} – media4u', { type: typeLabel }));
        
        let details = `${t('mehr_info.label_type', 'Typ')}: ${typeLabel}\n`;
        details += `${t('mehr_info.label_name', 'Name')}: ${formData.name}\n`;
        details += `${t('mehr_info.label_company', 'Unternehmen')}: ${formData.company}\n`;
        details += `${t('mehr_info.label_email', 'E-Mail')}: ${formData.email}\n`;
        details += requestType === 'premium' ? `Config-URL: ${formData.configUrl}\n` : `Backlink: ${formData.backlinkUrl}\n`;
        details += `${t('mehr_info.label_notes', 'Anmerkungen')}:\n${formData.message}`;
        
        const body = encodeURIComponent(details);
        window.location.href = `mailto:roman.messmer@me.com?subject=${subject}&body=${body}`;
        
        // Button-Sperre nach 5 Sekunden aufheben
        setTimeout(() => setIsSubmitting(false), 5000);
    };

    return (
        <div className="mehr-info">
            <header className="mehr-info__header">
                <h1 className="mehr-info__title">{t('mehr_info.main_title', 'Partner werden')}</h1>
                <p className="mehr-info__lead">{t('mehr_info.main_lead', 'Wählen Sie das passende Modell für Ihre Präsenz auf media4u.')}</p>
            </header>

            {/* Modell-Auswahl */}
            <div className="mehr-info__tablist" role="tablist">
                <button 
                    type="button"
                    className={`mehr-info__tab ${requestType === 'premium' ? 'mehr-info__tab--active' : ''}`} 
                    onClick={() => setRequestType('premium')}
                    role="tab"
                    aria-selected={requestType === 'premium'}
                    aria-controls="panel-premium"
                    id="tab-premium"
                >
                    {t('mehr_info.tab_premium', 'Premium Partner (Eigenregie)')}
                </button>
                <button 
                    type="button"
                    className={`mehr-info__tab ${requestType === 'support' ? 'mehr-info__tab--active' : ''}`} 
                    onClick={() => setRequestType('support')}
                    role="tab"
                    aria-selected={requestType === 'support'}
                    aria-controls="panel-support"
                    id="tab-support"
                >
                    {t('mehr_info.tab_support', 'Support Partner (Kostenlos)')}
                </button>
            </div>

            {/* Infoboxen */}
            <section className="mehr-info__panels">
                {requestType === 'premium' ? (
                    <div className="mehr-info__panel" id="panel-premium" role="tabpanel" aria-labelledby="tab-premium">
                        <h2 className="mehr-info__subtitle">{t('mehr_info.premium_title', 'Premium Modell')}</h2>
                        <p>{t('mehr_info.premium_desc', 'Sie erhalten das volle Paket mit dem /media4u/ Ordner. Sie verwalten Text und Bild selbst auf Ihrem Server.')}</p>
                        
                        <div className="mehr-info__pricing-wrapper">
                            <table className="mehr-info__pricing-table">
                                <thead>
                                    <tr>
                                        <th>{t('mehr_info.table_period', 'Zeitraum')}</th>
                                        <th>{t('mehr_info.table_price', 'Preis / 30 Tage')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{t('mehr_info.period_1', 'Tag 1 – 90')}</td>
                                        <td>140 CHF</td>
                                    </tr>
                                    <tr>
                                        <td>{t('mehr_info.period_2', 'Tag 91 – 180')}</td>
                                        <td>120 CHF</td>
                                    </tr>
                                    <tr>
                                        <td>{t('mehr_info.period_3', 'Ab Tag 181')}</td>
                                        <td>100 CHF</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <ul className="mehr-info__list">
                            <li>{t('mehr_info.premium_benefit_1', 'Volle Kontrolle über Inhalte')}</li>
                            <li>{t('mehr_info.premium_benefit_2', 'Keine Gegenleistung erforderlich')}</li>
                            <li>{t('mehr_info.premium_benefit_3', 'Priorisierte Platzierung')}</li>
                        </ul>
                    </div>
                ) : (
                    <div className="mehr-info__panel" id="panel-support" role="tabpanel" aria-labelledby="tab-support">
                        <h2 className="mehr-info__subtitle">{t('mehr_info.support_title', 'Support Modell')}</h2>
                        <p>{t('mehr_info.support_desc', 'Kostenlose Werbefläche für Partner, die media4u unterstützen. Wir schalten Ihre Anzeige manuell frei.')}</p>
                        <ul className="mehr-info__list">
                            <li>{t('mehr_info.support_benefit_1', 'Dauerhaft kostenlos')}</li>
                            <li>{t('mehr_info.support_benefit_2', 'Voraussetzung: Link oder Erwähnung von media4u auf Ihrer Seite')}</li>
                            <li>{t('mehr_info.support_benefit_3', 'Ideal für befreundete Projekte')}</li>
                        </ul>
                    </div>
                )}
            </section>

            <section className="mehr-info__form-section" aria-live="polite">
                {!showConfirmation ? (
                    <form className="mehr-info__form" onSubmit={handleSubmit} autoComplete="on">
                        {/* Honeypot (für Menschen unsichtbar) */}
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <input 
                                type="text" 
                                name="verify_id_field" 
                                value={hpValue} 
                                onChange={(e) => setHpValue(e.target.value)} 
                                tabIndex="-1"
                                autoComplete="off"
                            />
                        </div>

                        <h2 className="mehr-info__subtitle">
                            {t('mehr_info.form_title', 'Anfrage für {{type}}', { type: requestType === 'premium' ? 'Premium' : 'Support' })}
                        </h2>
                        
                        <div className="mehr-info__form-group">
                            <label htmlFor="name">{t('mehr_info.label_name', 'Ihr Name')}</label>
                            <input type="text" id="name" name="name" required maxLength="100" onChange={handleChange} value={formData.name} />
                        </div>
                        
                        <div className="mehr-info__form-group">
                            <label htmlFor="company">{t('mehr_info.label_company', 'Unternehmen / Projekt')}</label>
                            <input type="text" id="company" name="company" required maxLength="100" onChange={handleChange} value={formData.company} />
                        </div>

                        <div className="mehr-info__form-group">
                            <label htmlFor="email">{t('mehr_info.label_email', 'E-Mail-Adresse')}</label>
                            <input type="email" id="email" name="email" required onChange={handleChange} value={formData.email} />
                        </div>

                        {requestType === 'premium' ? (
                            <div className="mehr-info__form-group">
                                <label htmlFor="configUrl">{t('mehr_info.label_config_url', 'Link zur partner.json')}</label>
                                <input 
                                    type="url" 
                                    id="configUrl" 
                                    name="configUrl" 
                                    placeholder="https://ihre-domain.ch/media4u/partner.json" 
                                    required 
                                    onChange={handleChange} 
                                    value={formData.configUrl} 
                                />
                            </div>
                        ) : (
                            <div className="mehr-info__form-group">
                                <label htmlFor="backlinkUrl">{t('mehr_info.label_backlink_url', 'Link zur Erwähnung / Backlink')}</label>
                                <input 
                                    type="url" 
                                    id="backlinkUrl" 
                                    name="backlinkUrl" 
                                    placeholder="https://ihre-domain.ch/partner" 
                                    required 
                                    onChange={handleChange} 
                                    value={formData.backlinkUrl} 
                                />
                            </div>
                        )}

                        <div className="mehr-info__form-group">
                            <label htmlFor="message">{t('mehr_info.label_notes', 'Anmerkungen')}</label>
                            <textarea id="message" name="message" rows="4" maxLength="1000" onChange={handleChange} value={formData.message}></textarea>
                        </div>

                        <button type="submit" className="mehr-info__btn mehr-info__btn--primary">
                            {t('mehr_info.btn_check', 'Prüfen & Absenden')}
                        </button>
                    </form>
                ) : (
                    <div className="mehr-info__confirmation" role="dialog" aria-labelledby="confirm-title">
                        <h2 id="confirm-title" className="mehr-info__subtitle">{t('mehr_info.confirm_title', 'Zusammenfassung prüfen')}</h2>
                        <div className="mehr-info__summary">
                            <p><strong>{t('mehr_info.label_type', 'Typ')}:</strong> {requestType === 'premium' ? 'Premium' : 'Support'}</p>
                            <p><strong>{t('mehr_info.label_company', 'Firma')}:</strong> {sanitizedData.company}</p>
                            {requestType === 'premium' ? (
                                <p><strong>Config:</strong> {formData.configUrl}</p>
                            ) : (
                                <p><strong>Backlink:</strong> {formData.backlinkUrl}</p>
                            )}
                            {/* XSS-sichere Ausgabe von Plain-Text mit Zeilenumbrüchen */}
                            <div 
                                className="mehr-info__preview" 
                                dangerouslySetInnerHTML={{ __html: sanitizedData.message }} 
                            />
                        </div>
                        <div className="mehr-info__actions">
                            <button className="mehr-info__btn mehr-info__btn--secondary" onClick={() => setShowConfirmation(false)}>
                                {t('mehr_info.btn_back', 'Zurück')}
                            </button>
                            <button 
                                className="mehr-info__btn mehr-info__btn--send" 
                                onClick={sendEmail} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t('mehr_info.btn_sending', 'Wird geöffnet...') : t('mehr_info.btn_send_email', 'E-Mail senden')}
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default MehrInfo;