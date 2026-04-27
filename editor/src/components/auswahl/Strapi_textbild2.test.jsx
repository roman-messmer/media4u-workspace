import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StrapiTextbild2 from './Strapi_textbild2';

// Wir simulieren einen erfolgreichen Upload (Gibt 10 Frames zurück)
const mockUploadFrames = vi.fn().mockResolvedValue(10);

vi.mock('../../utils/useStrapiUploadTextbild2', () => ({
  useStrapiUploadTextbild2: () => ({ 
    uploadFrames: mockUploadFrames, 
    isLoading: false, 
    error: null 
  })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'de' } })
}));

// Wir simulieren die Antwort von Strapi für die Kategorien
global.fetch = vi.fn();

describe('Strapi Textbild2 Upload Wächter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 99, documentId: 'doc99', attributes: { Name: 'Dummy Kategorie' } }] })
    });
  });

  it('lädt Kategorien, füllt das Formular und feuert den Upload', async () => {
    render(<StrapiTextbild2 />);
    
    // 1. Warten, bis der Fetch für Kategorien fertig ist
    await waitFor(() => {
      expect(screen.getByText('Dummy Kategorie')).toBeInTheDocument();
    });
    
    // 2. Formularfelder ausfüllen
    fireEvent.change(screen.getByLabelText(/Name 2/i), { target: { value: 'Mein Super Kunstwerk' } });
    fireEvent.change(screen.getByLabelText(/Editor Quellcode/i), { target: { value: '<div class="frame"></div>' } });
    
    // 3. Absenden
    fireEvent.click(screen.getByRole('button', { name: /An Strapi senden/i }));
    
    // 4. Prüfen, ob der Hook mit den Formulardaten gerufen wurde
    await waitFor(() => {
      expect(mockUploadFrames).toHaveBeenCalled();
      // Prüft ob die Erfolgsmeldung im Screen erscheint
      expect(screen.getByText('Erfolgreich in Textbild 2 gespeichert mit 10 Frames')).toBeInTheDocument();
    });
  });
});