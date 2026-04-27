import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// 1. MOCK: Wir erweitern den Mock um das fehlende "i18n" Objekt
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key) => key,
      i18n: {
        language: 'de', // Simuliert die Sprache für deine Sprachen-Komponente
        changeLanguage: () => new Promise(() => {}) 
      }
    })
  };
});

describe('App Root Komponente (Smoke Test)', () => {
  it('rendert das Basis-Layout der Applikation ohne abzustürzen', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.wrapper_header')).toBeInTheDocument();
    expect(container.querySelector('.wrapper_nav_main')).toBeInTheDocument();
    expect(container.querySelector('.wrapper_content')).toBeInTheDocument();
    expect(container.querySelector('.wrapper_footer')).toBeInTheDocument();
    expect(container.querySelector('#anker')).toBeInTheDocument();
  });
});