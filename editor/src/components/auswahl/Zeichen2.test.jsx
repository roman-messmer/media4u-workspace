import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Zeichen2 from './Zeichen2';

const mockSetText = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    current: 0,
    getPrimaryActiveText: () => 'Init',
    setTextForActiveItems: mockSetText
  })
}));

describe('Zeichen2 Werkzeug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fügt ein Zeichen in den Text ein und aktualisiert den Context', () => {
    render(<Zeichen2 />);
    
    // Prüfen, ob Initialtext geladen wurde
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe('Init');

    // Wir suchen den Button für den Buchstaben "A"
    const aButton = screen.getByRole('button', { name: 'Zeichen A' });
    fireEvent.click(aButton);

    // Der Befehl setTextForActiveItems sollte mit dem neuen String gefeuert worden sein
    expect(mockSetText).toHaveBeenCalled();
  });
});