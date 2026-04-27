import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StrapiSMSTextbild from './Strapi_sms_textbild';

// Gibt in der Simulation 5 Frames zurück
const mockUploadFrames = vi.fn().mockResolvedValue(5);

vi.mock('../../utils/useStrapiUpload', () => ({
  useStrapiUpload: () => ({ 
    uploadFrames: mockUploadFrames, 
    isLoading: false, 
    error: null 
  })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'de' } })
}));

global.fetch = vi.fn();

describe('Strapi SMS Textbild Upload Wächter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1, documentId: 'doc1', attributes: { Name: 'SMS Dummy Kategorie' } }] })
    });
  });

  it('lädt Kategorien und sendet das Formular ab', async () => {
    render(<StrapiSMSTextbild />);
    
    // Warten bis Kategorie geladen ist
    await waitFor(() => {
      expect(screen.getByText('SMS Dummy Kategorie')).toBeInTheDocument();
    });
    
    // Formular ausfüllen
    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'Mein SMS Kunstwerk' } });
    fireEvent.change(screen.getByLabelText(/Editor Quellcode/i), { target: { value: '<div class="frame"></div>' } });
    
    // Absenden
    fireEvent.click(screen.getByRole('button', { name: /An Strapi senden/i }));
    
    // Erfolgsmeldung prüfen
    await waitFor(() => {
      expect(mockUploadFrames).toHaveBeenCalled();
      expect(screen.getByText('Erfolgreich gespeichert mit 5 Frames')).toBeInTheDocument();
    });
  });
});