import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Neu from './neu';

global.fetch = vi.fn();
vi.stubEnv('VITE_STRAPI_URL', 'http://localhost:1337');

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to} data-testid="mock-link">{children}</a>
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // Wir mocken den Titel, damit der Test etwas auf der Seite finden kann
    t: (key) => key === 'neu.title' ? 'Neu Dummy Titel' : key,
    i18n: { language: 'de', split: () => ['de'] }
  })
}));

vi.mock('../werbung/werbung.jsx', () => ({ default: () => <div data-testid="mock-werbung">Werbung Dummy</div> }));
vi.mock('../script/useVisibilityObserver', () => ({ useVisibilityObserver: vi.fn() }));

describe('Neu Komponente (Übersicht)', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });

  it('zeigt initial den Ladezustand an', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    render(<Neu />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('rendert die Textbilder nach erfolgreichem API-Aufruf', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/get-location')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ countryCode: 'CH' }) });
      }
      
      if (url.includes('/api/sms-textbilds')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [{
              id: 1,
              attributes: {
                Link: 'test',
                Name_Preview: [{ Name_Preview_Deutsch: 'Mein Neues Bild' }],
                Textfeldgruppe: [{ Preview: true, Sprachen_Frame_Deutsch: '<div></div>' }]
              }
            }]
          })
        });
      }
      return Promise.reject(new Error('Nicht gefunden'));
    });

    render(<Neu />);

    await waitFor(() => {
      // Prüft den h1 Titel aus der i18n Übersetzung
      expect(screen.getByText('Neu Dummy Titel')).toBeInTheDocument();
      // Prüft das geladene Bild
      expect(screen.getByText('Mein Neues Bild')).toBeInTheDocument();
      // Prüft den Werbe-Dummy
      expect(screen.getByTestId('mock-werbung')).toBeInTheDocument();
    });
  });
});