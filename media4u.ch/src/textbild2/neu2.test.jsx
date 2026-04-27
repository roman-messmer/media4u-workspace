import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Neu2 from './neu2';

global.fetch = vi.fn();
vi.stubEnv('VITE_STRAPI_URL', 'http://localhost:1337');

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to} data-testid="mock-link">{children}</a>,
  useNavigate: () => vi.fn(),
  useParams: () => ({})
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key === 'neu2.title' ? 'Neu 2 Dummy Titel' : key,
    i18n: { language: 'de', split: () => ['de'] }
  })
}));

vi.mock('../werbung/werbung.jsx', () => ({ default: () => <div data-testid="mock-werbung">Werbung Dummy</div> }));
vi.mock('../script/useVisibilityObserver', () => ({ useVisibilityObserver: vi.fn() }));

describe('Neu 2 Komponente (Übersicht)', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });

  it('zeigt initial den Ladezustand an', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    render(<Neu2 />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('rendert die Textbilder nach erfolgreichem API-Aufruf', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/get-location')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ countryCode: 'CH' }) });
      }
      
      if (url.includes('/api/textbild2s')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [{
              id: 1,
              attributes: {
                Link2: 'test',
                Name_Preview2: [{ Name_Preview_Deutsch: 'Mein Neues Bild 2' }],
                Textfeldgruppe2: [{ Preview: true, Sprachen_Frame_Deutsch: '<div></div>' }],
                textbild2_kategorie: { data: [{ attributes: { Slug: 'irgendeine_kategorie' } }] }
              }
            }]
          })
        });
      }
      return Promise.reject(new Error('Nicht gefunden'));
    });

    render(<Neu2 />);

    await waitFor(() => {
      expect(screen.getByText('Neu 2 Dummy Titel')).toBeInTheDocument();
      expect(screen.getByText('Mein Neues Bild 2')).toBeInTheDocument();
      expect(screen.getByTestId('mock-werbung')).toBeInTheDocument();
    });
  });
});