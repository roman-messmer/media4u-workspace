import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DisplayTextbild2 from './DisplayTextbild2';

// 1. Mocks für Context und die neue generische Konsole
const mockSetActive = vi.fn();
const mockToggleItem = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    isItemActive: (frameIdx, itemIdx) => false,
    setActive: mockSetActive,
    toggleItem: mockToggleItem
  })
}));

// WICHTIG: Pfad auf ../console/Console angepasst und data-testid beibehalten
vi.mock('../console/Console', () => ({
  default: () => <div data-testid="mock-console-2">Console Dummy</div>
}));

describe('DisplayTextbild2 Komponente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rendert das Grid und die Konsole erfolgreich', () => {
    render(<DisplayTextbild2 frames={[]} />);
    // Sucht nun erfolgreich den Mock der neuen Konsole
    expect(screen.getByTestId('mock-console-2')).toBeInTheDocument();
  });

  it('berechnet das CSS-Grid und die Klassen korrekt für ein Frame', () => {
    const testFrames = [
      [
        { row: 1, col: 1, rspan: 1, cspan: 1, text: 'Test' }
      ]
    ];

    render(<DisplayTextbild2 frames={testFrames} current={0} />);
    
    const element = screen.getByText('Test');
    expect(element).toBeInTheDocument();
    // Prüft, ob das Grid-Area Shorthand korrekt gesetzt wurde
    expect(element).toHaveStyle('grid-area: 1 / 1 / span 1 / span 1');
  });

  it('reagiert auf Klicks und ruft den Context auf', () => {
    const testFrames = [[{ row: 1, col: 1, text: 'Klick' }]];
    render(<DisplayTextbild2 frames={testFrames} current={0} />);

    fireEvent.click(screen.getByText('Klick'));
    expect(mockSetActive).toHaveBeenCalledWith(0, 0);
  });
});