import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DisplaySmsTextbild from './DisplaySmsTextbild';

// Mocks für SMS Context und die neue generische Konsole
const mockSetActive = vi.fn();
const mockToggleItem = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    isItemActive: (frameIdx, itemIdx) => false,
    setActive: mockSetActive,
    toggleItem: mockToggleItem
  })
}));

// Pfad auf die neue generische Console.jsx angepasst
vi.mock('../console/Console', () => ({
  default: () => <div data-testid="mock-console-sms">SMS Console Dummy</div>
}));

describe('DisplaySmsTextbild Komponente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rendert ohne abzustürzen', () => {
    render(<DisplaySmsTextbild frames={[]} />);
    // Bestätigt, dass der Console-Mock gerendert wurde
    expect(screen.getByTestId('mock-console-sms')).toBeInTheDocument();
  });

  it('positioniert SMS-Zeilen korrekt im Grid', () => {
    const testFrames = [
      [
        { row: 5, col: 10, text: 'Nokia Style' },
        { row: 6, center: true, text: 'Zentriert' } 
      ]
    ];

    render(<DisplaySmsTextbild frames={testFrames} current={0} cols={64} />);

    const normalElement = screen.getByText('Nokia Style');
    expect(normalElement).toBeInTheDocument();
    // Prüft das berechnete grid-area Shorthand
    expect(normalElement).toHaveStyle('grid-area: 5 / 10 / span 1 / span 1');
    expect(normalElement).not.toHaveClass('center');

    const centeredElement = screen.getByText('Zentriert');
    expect(centeredElement).toBeInTheDocument();
    expect(centeredElement).toHaveClass('center');
  });

  it('ruft setActive bei Klick auf', () => {
    const testFrames = [[{ row: 1, col: 1, text: 'Auswählen' }]];
    render(<DisplaySmsTextbild frames={testFrames} current={0} />);

    fireEvent.click(screen.getByText('Auswählen'));
    expect(mockSetActive).toHaveBeenCalledWith(0, 0);
  });
});