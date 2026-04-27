import { useState, useEffect } from 'react';

export default function useGeoIp() {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGeoIp = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = import.meta.env.VITE_STRAPI_URL || 'https://cms.media4u.ch';
        
        // WICHTIG: Nutze die Route, die in Strapi als "Bound Route" definiert ist
        const response = await fetch(`${baseUrl}/api/geo-ip`, { signal });

        if (!response.ok) {
          throw new Error(`HTTP Fehler Status ${response.status}`);
        }

        const data = await response.json();
        
        // Extraktion: Strapi Plugins liefern oft { country: 'DE' }
        // Wir nehmen den Wert und wandeln ihn zur Sicherheit in Großbuchstaben um
        const rawCountry = data.country || data.countryCode || (typeof data === 'string' ? data : null);
        const detectedCountry = rawCountry ? rawCountry.toUpperCase() : null;
        
        console.log("Geo-IP Response:", data); // Debugging
        console.log("Erkanntes Land:", detectedCountry);

        setCountry(detectedCountry);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fehler beim Laden der Geo IP:', err);
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchGeoIp();

    return () => {
      controller.abort();
    };
  }, []);

  return { country, loading, error };
}