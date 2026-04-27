import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Werbung from './Werbung';
import useGeoIp from '../module/utils/useGeoIp';

// 1. MOCKS: Wir simulieren alle externen Abhängigkeiten
global.fetch = vi.fn();

// Simuliert die Vite Umgebungsvariable
vi.stubEnv('VITE_STRAPI_URL', 'http://localhost:1337');

// Simuliert die Übersetzungen (gibt einfach den Fallback-Text zurück)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key
  })
}));

// Simuliert den React Router (wir tun so, als wären wir auf der Startseite)
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' })
}));

// Simuliert deinen eigenen Geo-IP Hook
vi.mock('../module/utils/useGeoIp', () => ({
  default: vi.fn()
}));

// Simuliert die Sanitization (gibt das HTML für den Test einfach 1:1 durch)
vi.mock('../module/utils/sanitizeHtml', () => ({
  sanitizeHtml: (html) => html
}));

describe('Werbung Komponente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Standard-Verhalten für den Geo-IP Hook definieren
    useGeoIp.mockReturnValue({ country: 'CH', loading: false, error: null });
  });

  it('zeigt initial den Ladezustand an', () => {
    // Fetch blockieren, damit die Komponente im Ladezustand bleibt
    fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<Werbung />);
    
    // Prüft, ob das div mit aria-busy="true" existiert
    const loadingWrapper = screen.getByText('Wird geladen...').closest('div');
    expect(loadingWrapper).toHaveAttribute('aria-busy', 'true');
  });

  it('zeigt eine barrierefreie Fehlermeldung bei API-Fehlern', async () => {
    // Einen 500er Serverfehler von Strapi simulieren
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    render(<Werbung />);

    // Warten, bis der Fetch verarbeitet wurde
    await waitFor(() => {
      const errorWrapper = screen.getByRole('alert');
      expect(errorWrapper).toBeInTheDocument();
      expect(screen.getByText(/Inhalte konnten nicht geladen werden/)).toBeInTheDocument();
    });
  });

  it('rendert die Werbe-Karten erfolgreich nach dem Fetch', async () => {
    // Erfolgreiche Strapi-Antwort mit einer gültigen Dummy-Karte simulieren
    const mockApiResponse = {
      data: [
        {
          id: 1,
          attributes: {
            title: 'Tolle Partner-Werbung',
            cardType: 'partner',
            targetCountries: ['ALL'],
            validityPeriods: [],
            werbung_kategories: { data: [] } // Zeigt auf allen Seiten
          }
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(<Werbung />);

    await waitFor(() => {
      // Prüft, ob der Titel unserer Dummy-Karte im DOM aufgetaucht ist
      expect(screen.getByText('Tolle Partner-Werbung')).toBeInTheDocument();
      
      // Prüft, ob die feste Info-Box "Werbeplatz sichern!" gerendert wurde
      expect(screen.getByText('Werbeplatz sichern!')).toBeInTheDocument();
    });
  });
});