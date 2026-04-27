// Strapi_textbild2.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStrapiUploadTextbild2 } from '../../utils/useStrapiUploadTextbild2'; 
import './Strapi.css';

const resolveContent = (json) => {
  if (json?.data) return json.data;
  return json;
};

export default function StrapiTextbild2() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'de';

  const [formData, setFormData] = useState({
    name: '',
    link: '',
    namePreviewDe: '',
    animationStatus: 'online',
    categoryIds: [],
    htmlCode: ''
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { uploadFrames, isLoading: isUploading, error: uploadError } = useStrapiUploadTextbild2();

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_STRAPI_URL}/api/textbild2-categories?locale=${currentLang}`,
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

    return () => controller.abort();
  }, [currentLang]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, categoryIds: selectedOptions }));
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const autoLink = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setFormData(prev => ({ ...prev, name: newName, link: autoLink }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    const frameCount = await uploadFrames({
      htmlCode: formData.htmlCode,
      name: formData.name,
      link: formData.link,
      animationStatus: formData.animationStatus,
      categoryIds: formData.categoryIds,
      namePreviewDe: formData.namePreviewDe
    });

    if (frameCount) {
      setSuccessMsg(`Erfolgreich in Textbild 2 gespeichert mit ${frameCount} Frames`);
      setFormData({
        name: '', link: '', namePreviewDe: '', animationStatus: 'online', categoryIds: [], htmlCode: ''
      });
    }
  };

  return (
    <div className="strapi_textbild2" aria-busy={isUploading || loadingCategories}>
      <h2>Neues Textbild 2 anlegen</h2>

      {categoryError && <div role="alert" className="error-message">Fehler Kategorien: {categoryError}</div>}
      {uploadError && <div role="alert" className="error-message">Upload Fehler: {uploadError}</div>}
      {successMsg && <div role="status" aria-live="polite" className="success-message">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="sms-formular">
        <div className="form-group">
          <label htmlFor="name">Name 2</label>
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
          <label htmlFor="animationStatus">Animation Status 2</label>
          <select id="animationStatus" name="animationStatus" value={formData.animationStatus} onChange={handleChange}>
            <option value="online">Online</option>
            <option value="reserve">Reserve (Entwurf)</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="categoryIds">Kategorien (Textbild 2)</label>
          <select id="categoryIds" name="categoryIds" multiple value={formData.categoryIds} onChange={handleCategoryChange} disabled={loadingCategories}>
            {categories.map(cat => {
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