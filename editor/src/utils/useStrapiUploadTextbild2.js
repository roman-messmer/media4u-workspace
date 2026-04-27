// useStrapiUploadTextbild2.js
import { useState, useRef } from 'react';

export const useStrapiUploadTextbild2 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const abortControllerRef = useRef(null);

  const uploadFrames = async ({ 
    htmlCode, 
    name, 
    link, 
    animationStatus, 
    categoryIds, 
    namePreviewDe 
  }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    abortControllerRef.current = new AbortController();

    try {
      if (!htmlCode) throw new Error("Fehler: Kein Quellcode vorhanden.");

      const parser = new DOMParser();
      const virtuellesDokument = parser.parseFromString(htmlCode, 'text/html');
      const frameElements = virtuellesDokument.querySelectorAll('.frame');
      const textfeldgruppeArray = [];

      frameElements.forEach((frame) => {
        const hasCenter = frame.querySelector('.center') !== null;

        if (hasCenter) {
          textfeldgruppeArray.push({
            ASCII_Frame: "",
            Sprachen_Frame_Deutsch: frame.outerHTML
          });
        } else {
          textfeldgruppeArray.push({
            ASCII_Frame: frame.outerHTML,
            Sprachen_Frame_Deutsch: ""
          });
        }
      });

      // Payload für Textbild 2 zusammenbauen mit den exakten Feldnamen aus dem Screenshot
      const strapiData = {
        data: {
          Name2: name, 
          Link2: link,                                // FIX: Link2
          Animation_Status2: animationStatus,         // FIX: Animation_Status2
          textbild2_kategorie: categoryIds, 
          Name_Preview2: [                            // FIX: Array, da Repeatable Component
            {
              Name_Preview_Deutsch: namePreviewDe
            }
          ],
          Textfeldgruppe2: textfeldgruppeArray 
        }
      };

      const apiUrl = `${import.meta.env.VITE_STRAPI_URL}/api/textbild2s`;
      const token = import.meta.env.VITE_STRAPI_TOKEN;

      const response = await fetch(apiUrl, {
        method: 'POST',
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(strapiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Unbekannter Fehler beim Senden an Strapi.");
      }

      setSuccess(true);
      return frameElements.length;

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const abortUpload = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  return { uploadFrames, abortUpload, isLoading, error, success };
};