import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Zeilen from './Zeilen';

const mockUpdateClasses = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    current: 0,
    updateClassesForActiveItems: mockUpdateClasses
  })
}));

describe('Zeilen Werkzeug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Nach jedem Test putzen wir unseren unsichtbaren Browser
    document.body.innerHTML = ''; 
  });

  it('rendert alle Zeilen- und Bold-Buttons', () => {
    render(<Zeilen />);

    expect(screen.getByRole('button', { name: 'Zeilen 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
  });

  it('feuert updateClassesForActiveItems bei einem Klick, wenn aktiv', () => {
    // DER TRICK: Wir pflanzen echtes HTML in den jsdom-Browser!
    // So funktionieren alle querySelector-Aufrufe in deiner Komponente ganz natürlich.
    document.body.innerHTML = `
      <figure class="textbild2">
        <div class="display">
          <div class="frame show">
            <pre class="zeilen4 active"></pre>
          </div>
        </div>
      </figure>
    `;

    render(<Zeilen />);
    
    // Da das HTML nun existiert, liest Zeilen.jsx aus, dass ein PRE aktiv ist.
    // Der Button darf also nicht mehr "disabled" sein!
    const zeilen16Button = screen.getByRole('button', { name: 'Zeilen 16' });
    expect(zeilen16Button).not.toBeDisabled();
    
    // Klick simulieren
    fireEvent.click(zeilen16Button);
    expect(mockUpdateClasses).toHaveBeenCalled();
  });
});