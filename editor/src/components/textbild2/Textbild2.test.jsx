import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Textbild2 from './Textbild2';

// Mock für das Display, da dieses bereits separat getestet wird
vi.mock('../display/DisplayTextbild2', () => ({
  default: () => <div data-testid="mock-display-2">Mock Display 2</div>
}));

describe('Textbild2 Wrapper', () => {
  it('rendert den Wrapper mit korrektem aria-label und Kind-Komponente', () => {
    render(<Textbild2 />);
    
    // Prüft den Wrapper-Container auf aria-label und CSS-Klasse
    const wrapper = screen.getByLabelText('Textbild2');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('textbild2');
    
    // Prüft, ob die Kind-Komponente gerendert wurde
    expect(screen.getByTestId('mock-display-2')).toBeInTheDocument();
  });
});