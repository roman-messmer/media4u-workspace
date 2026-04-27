import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FrameListTextbild2 from './FrameListTextbild2';

// Mocks für Context und Assets
const mockSetTotal = vi.fn();
const mockToggleItem = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    setTotal: mockSetTotal,
    toggleItem: mockToggleItem,
    isItemActive: (f, i) => i === 0, // Erstes Item aktiv simulieren
    getItemText: (f, i, text) => text
  })
}));

vi.mock('../../assets/file-word.svg', () => ({ default: 'mock-word-icon' }));

describe('FrameListTextbild2 Komponente', () => {
  const testFrames = [
    [{ text: 'A' }, { text: 'Wort' }], // Frame 0
    [{ text: 'B' }]                  // Frame 1
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('meldet die korrekte Anzahl an Frames an den Context', () => {
    render(<FrameListTextbild2 frames={testFrames} current={0} />);
    expect(mockSetTotal).toHaveBeenCalledWith(2);
  });

  it('zeigt ein Icon für Texte länger als ein Zeichen an', () => {
    render(<FrameListTextbild2 frames={testFrames} current={0} />);
    
    // Das Zeichen 'A' sollte als Text gerendert werden
    expect(screen.getByText('A')).toBeInTheDocument();
    
    // Das Wort 'Wort' sollte ein Icon triggern
    const icon = screen.getByAltText('Wort');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', 'mock-word-icon');
  });

  it('ruft toggleItem auf, wenn ein Item im aktiven Frame geklickt wird', () => {
    render(<FrameListTextbild2 frames={testFrames} current={0} />);
    
    const item = screen.getByText('A');
    fireEvent.click(item);
    
    // Stoppt Propagation und ruft toggle auf
    expect(mockToggleItem).toHaveBeenCalledWith(0, 0);
  });

  it('ruft onSelect auf, wenn ein ganzer Frame-Block geklickt wird', () => {
    const mockOnSelect = vi.fn();
    render(<FrameListTextbild2 frames={testFrames} current={0} onSelect={mockOnSelect} />);
    
    const frameGroup = screen.getAllByRole('list')[1]; // Den zweiten Frame wählen
    fireEvent.click(frameGroup);
    
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });
});