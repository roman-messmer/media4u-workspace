import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FesttageParty2 from './festtage_party2';

global.fetch = vi.fn();
vi.stubEnv('VITE_STRAPI_URL', 'http://localhost:1337');

vi.mock('react-router-dom', () => ({
  useParams: () => ({ displayId: 'test-item-1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to }) => <a href={to} data-testid="mock-link">{children}</a>
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key === 'festtage_party2.title' ? 'Party 2 Dummy Titel' : key, i18n: { language: 'de', split: () => ['de'] } })
}));

vi.mock('../werbung/werbung.jsx', () => ({ default: () => <div data-testid="mock-werbung">Werbung Dummy</div> }));
vi.mock('../module/console_textbild2/console_textbild2.jsx', () => ({ default: () => <div data-testid="mock-console">Konsole Dummy</div> }));
vi.mock('../script/useVisibilityObserver', () => ({ useVisibilityObserver: vi.fn() }));

describe('Festtage & Party 2 Kategorie', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });

  it('zeigt initial den Ladezustand an', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    render(<FesttageParty2 />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('rendert die Textbilder nach erfolgreichem API-Aufruf', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/get-location')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ countryCode: 'CH' }) });
      if (url.includes('/api/textbild2s')) return Promise.resolve({ 
        ok: true, json: () => Promise.resolve({ data: [{ id: 1, attributes: { Link2: 'test-item-1', Name_Preview2: [{ Name_Preview_Deutsch: 'Mein Party Bild 2' }], Textfeldgruppe2: [{ Preview: true, Sprachen_Frame_Deutsch: '<div></div>' }], textbild2_kategorie: { data: [{ attributes: { Slug: 'festtage_party2' } }] } } }] }) 
      });
      return Promise.reject(new Error('Nicht gefunden'));
    });

    render(<FesttageParty2 />);
    await waitFor(() => {
      expect(screen.getByText('Party 2 Dummy Titel')).toBeInTheDocument();
      expect(screen.getAllByText('Mein Party Bild 2')[0]).toBeInTheDocument();
    });
  });
});