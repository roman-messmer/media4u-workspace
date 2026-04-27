import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SportHobby from './sport_hobby';

global.fetch = vi.fn();
vi.stubEnv('VITE_STRAPI_URL', 'http://localhost:1337');

vi.mock('react-router-dom', () => ({
  useParams: () => ({ displayId: 'test-item-1' }),
  Link: ({ children, to }) => <a href={to} data-testid="mock-link">{children}</a>
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'de', split: () => ['de'] }
  })
}));

vi.mock('../werbung/werbung.jsx', () => ({ default: () => <div data-testid="mock-werbung">Werbung Dummy</div> }));
vi.mock('../module/console_sms_textbild/console_sms_textbild.jsx', () => ({ default: () => <div data-testid="mock-console">Konsole Dummy</div> }));
vi.mock('../script/useVisibilityObserver', () => ({ useVisibilityObserver: vi.fn() }));

describe('Sport & Hobby Kategorie', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });

  it('zeigt initial den Ladezustand an', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    render(<SportHobby />);
    expect(screen.getByText('Wird geladen...')).toBeInTheDocument();
  });

  it('rendert die Kategorie nach erfolgreichem API-Aufruf', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/get-location')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ countryCode: 'CH' }) });
      if (url.includes('/api/sms-textbild-kategories')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ attributes: { Name: 'Sport Dummy Kategorie' } }] }) });
      if (url.includes('/api/sms-textbilds')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ id: 1, attributes: { Link: 'test', Name_Preview: [{ Name_Preview_Deutsch: 'Mein Bild' }], Textfeldgruppe: [{ Preview: true, Sprachen_Frame_Deutsch: '<div></div>' }] } }] }) });
      return Promise.reject(new Error('Nicht gefunden'));
    });

    render(<SportHobby />);

    await waitFor(() => {
      expect(screen.getByText('Sport Dummy Kategorie')).toBeInTheDocument();
      expect(screen.getByText('Mein Bild')).toBeInTheDocument();
      expect(screen.getByTestId('mock-werbung')).toBeInTheDocument();
    });
  });
});