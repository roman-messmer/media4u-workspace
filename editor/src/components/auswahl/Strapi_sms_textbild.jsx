import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { useStrapiUpload } from '../../utils/useStrapiUpload';
import './Strapi.css';

// Hilfsfunktion zum Extrahieren der Strapi Datenstruktur
const resolveContent = (json) => {
  if (json?.data) return json.data;
  return json;
};

export default function StrapiSMSTextbild() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'de';

  // State für die Formulareingaben
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    namePreviewDe: '',
    animationStatus: 'online',
    categoryIds: [],
    htmlCode: ''
  });

  // States für Kategorien
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // HIER HOLEN WIR DIE LOGIK AUS DEINEM HOOK:
  const { uploadFrames, isLoading: isUploading, error: uploadError } = useStrapiUpload();

  const abortControllerRef = useRef(null);

  // Kategorien beim Mounten laden
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_STRAPI_URL}/api/sms-textbild-categories?locale=${currentLang}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Kategorien konnten nicht geladen werden');
        
        const json = await response.json();
        const data = resolveContent(json);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setCategoryError(err.message);
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, [currentLang]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // === FIX FÜR STRAPI v5 (DOCUMENT ID STATT NUMBER) ===
  const handleCategoryChange = (e) => {
    // Hier lassen wir den Wert als String, damit die documentId übergeben wird
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, categoryIds: selectedOptions }));
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const autoLink = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setFormData(prev => ({ ...prev, name: newName, link: autoLink }));
  };

  // ABSENDEN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    // Wir übergeben einfach alle Daten an deinen Hook.
    const frameCount = await uploadFrames({
      htmlCode: formData.htmlCode,
      name: formData.name,
      link: formData.link,
      animationStatus: formData.animationStatus,
      categoryIds: formData.categoryIds,
      namePreviewDe: formData.namePreviewDe
    });

    // Wenn der Hook uns eine Anzahl zurückgibt, war es erfolgreich
    if (frameCount) {
      setSuccessMsg(`Erfolgreich gespeichert mit ${frameCount} Frames`);
      setFormData({
        name: '', link: '', namePreviewDe: '', animationStatus: 'online', categoryIds: [], htmlCode: ''
      });
    }
  };

  return (
    <div className="strapi_sms_textbild" aria-busy={isUploading || loadingCategories}>
      <h2>Neues SMS Textbild anlegen</h2>

      {categoryError && (
        <div role="alert" className="error-message">Fehler Kategorien: {categoryError}</div>
      )}
      
      {/* Wir zeigen den Fehler aus deinem Hook an */}
      {uploadError && (
        <div role="alert" className="error-message">Upload Fehler: {uploadError}</div>
      )}
      
      {successMsg && (
        <div role="status" aria-live="polite" className="success-message">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="sms-formular">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={formData.name} onChange={handleNameChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="link">Link (UID)</label>
          <input id="link" name="link" type="text" value={formData.link} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="namePreviewDe">Name Preview Deutsch</label>
          <input id="namePreviewDe" name="namePreviewDe" type="text" value={formData.namePreviewDe} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="animationStatus">Animation Status</label>
          <select id="animationStatus" name="animationStatus" value={formData.animationStatus} onChange={handleChange}>
            <option value="online">Online</option>
            <option value="reserve">Reserve (Entwurf)</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="categoryIds">Kategorien</label>
          <select id="categoryIds" name="categoryIds" multiple value={formData.categoryIds} onChange={handleCategoryChange} disabled={loadingCategories}>
            {categories.map(cat => {
              // Strapi v5 nutzt documentId, wir machen einen Fallback auf id für alte Einträge
              const relationId = cat.documentId || cat.id;
              
              return (
                <option key={relationId} value={relationId}>
                  {cat.attributes?.Name || cat.Name || `Kategorie ${relationId}`}
                </option>
              );
            })}
          </select>
          {loadingCategories && <span>Lade Kategorien...</span>}
        </div>

        <div className="form-group">
          <label htmlFor="htmlCode">Editor Quellcode</label>
          <textarea id="htmlCode" name="htmlCode" rows="10" value={formData.htmlCode} onChange={handleChange} placeholder="<div class='frame'>...</div>" required />
        </div>

        <button type="submit" disabled={isUploading || loadingCategories}>
          {isUploading ? 'Speichere...' : 'An Strapi senden'}
        </button>
      </form>
    </div>
  );
}