// useStrapiUpload.js
import { useState, useRef } from 'react';

export const useStrapiUpload = () => {
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
      if (!htmlCode) {
        throw new Error("Fehler: Kein Quellcode vorhanden.");
      }

      // 1. HTML parsen und Frames extrahieren
      const parser = new DOMParser();
      const virtuellesDokument = parser.parseFromString(htmlCode, 'text/html');
      const frameElements = virtuellesDokument.querySelectorAll('.frame');
      const textfeldgruppeArray = [];

      // === HIER IST DIE NEUE LOGIK FÜR DIE VERTEILUNG ===
      frameElements.forEach((frame) => {
        // Prüfen, ob dieser Frame ein Element mit der Klasse .center enthält
        const hasCenter = frame.querySelector('.center') !== null;

        if (hasCenter) {
          // Es ist ein Text-Frame: HTML kommt in Sprachen_Frame_Deutsch, ASCII bleibt leer
          textfeldgruppeArray.push({
            ASCII_Frame: "",
            Sprachen_Frame_Deutsch: frame.outerHTML
          });
        } else {
          // Es ist ein Bild-Frame: HTML kommt in ASCII_Frame, Sprachen bleibt leer
          textfeldgruppeArray.push({
            ASCII_Frame: frame.outerHTML,
            Sprachen_Frame_Deutsch: ""
          });
        }
      });

      // 2. Payload für Strapi zusammenbauen
      const strapiCategoryKey = 'sms_textbild_kategorie'; 

      const strapiData = {
        data: {
          Name: name,
          Link: link,
          Animation_Status: animationStatus,
          [strapiCategoryKey]: categoryIds, // Dynamischer Key für die Relation
          Name_Preview: {
            Name_Preview_Deutsch: namePreviewDe
          },
          Textfeldgruppe: textfeldgruppeArray
        }
      };

      const apiUrl = `${import.meta.env.VITE_STRAPI_URL}/api/sms-textbilds`;
      const token = import.meta.env.VITE_STRAPI_TOKEN;

      // 3. Request absenden
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
        console.error("Strapi Upload Fehler:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const abortUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { uploadFrames, abortUpload, isLoading, error, success };
};