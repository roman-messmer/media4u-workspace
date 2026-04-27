import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Auswahl from './Auswahl';

// 1. Simuliere, dass wir auf der Textbild2-Route sind
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/textbild2/test-id' })
}));

// 2. Simuliere die Toggles (Nur Zeichen & Zeilen sind aktiv)
vi.mock('../../context/UiToggleContext', () => ({
  useUiToggles: () => ({
    showZeichenTextbild2: true,
    showZeilenTextbild2: true,
    showSpiegelnTextbild2: false,
    showFarbenTextbild2: false,
    showStrapiTextbild2: false,
    showStrapiSMSTextbild: false
  })
}));

// 3. Dummys für alle Nachbarn im auswahl-Ordner (mit ./)
vi.mock('./Zeichen2', () => ({ default: () => <div data-testid="dummy-zeichen2" /> }));
vi.mock('./Zeilen', () => ({ default: () => <div data-testid="dummy-zeilen" /> }));
vi.mock('./SpiegelnDrehen', () => ({ default: () => <div data-testid="dummy-spiegeln" /> }));
vi.mock('./Color', () => ({ default: () => <div data-testid="dummy-color" /> }));
vi.mock('./Strapi_textbild2', () => ({ default: () => <div data-testid="dummy-strapi" /> }));
vi.mock('./Strapi_sms_textbild', () => ({ default: () => <div data-testid="dummy-strapi-sms" /> }));
vi.mock('./Zeichen', () => ({ default: () => <div data-testid="dummy-zeichen" /> }));

describe('Auswahl Routing-Kreuzung', () => {
  it('rendert NUR die im Context aktivierten Werkzeuge für Textbild2', () => {
    render(<Auswahl />);
    
    // Diese beiden MÜSSEN da sein (Toggle = true)
    expect(screen.getByTestId('dummy-zeichen2')).toBeInTheDocument();
    expect(screen.getByTestId('dummy-zeilen')).toBeInTheDocument();
    
    // Dieses darf NICHT da sein (Toggle = false)
    expect(screen.queryByTestId('dummy-spiegeln')).not.toBeInTheDocument();
  });
});