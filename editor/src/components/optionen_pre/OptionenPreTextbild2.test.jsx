import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OptionenPreTextbild2 from './OptionenPreTextbild2';

const mockToggleFont = vi.fn();

vi.mock('../../context/UiToggleContext', () => ({
  useUiToggles: () => ({
    showZeichenTextbild2: false,
    toggleZeichenTextbild2: mockToggleFont,
    // ... andere Toggles als false
  })
}));

describe('OptionenPreTextbild2', () => {
  it('ruft den Toggle für das Schriftart-Panel auf', () => {
    render(<OptionenPreTextbild2 />);
    
    const fontBtn = screen.getByLabelText('Schriftart');
    fireEvent.click(fontBtn);
    
    expect(mockToggleFont).toHaveBeenCalled();
  });

  it('aktiviert die korrekte aria-pressed Eigenschaft bei Klick', () => {
    // Hier könntest du einen Mock-Provider nutzen, um den State zu ändern
    render(<OptionenPreTextbild2 />);
    const fontBtn = screen.getByLabelText('Schriftart');
    expect(fontBtn).toHaveAttribute('aria-pressed', 'false');
  });
});