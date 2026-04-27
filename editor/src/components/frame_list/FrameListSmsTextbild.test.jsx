import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FrameListSmsTextbild from './FrameListSmsTextbild';

// Mocks für den Context und das SVG-Asset
const mockSetTotal = vi.fn();
const mockToggleItem = vi.fn();
const mockIsItemActive = vi.fn();
const mockGetItemText = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    setTotal: mockSetTotal,
    toggleItem: mockToggleItem,
    isItemActive: mockIsItemActive,
    getItemText: mockGetItemText,
    ensurePrimaryActive: vi.fn()
  })
}));

vi.mock('../../assets/file-word.svg', () => ({
  default: 'word-icon-path'
}));

describe('FrameListSmsTextbild Komponente', () => {
  const testFrames = [
    [{ text: 'A' }, { text: 'Hallo' }], // Frame 0
    []                                  // Frame 1 (leer)
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Standard-Rückgabewerte für die Mocks
    mockIsItemActive.mockImplementation((fIdx, iIdx) => fIdx === 0 && iIdx === 0);
    mockGetItemText.mockImplementation((fIdx, iIdx, fallback) => fallback);
  });

  it('meldet die Anzahl der Frames an den Context', () => {
    render(<FrameListSmsTextbild frames={testFrames} current={0} />);
    expect(mockSetTotal).toHaveBeenCalledWith(2);
  });

  it('rendert einzelne Zeichen als Text und Wörter als Icons', () => {
    render(<FrameListSmsTextbild frames={testFrames} current={0} />);

    // 'A' hat Länge 1 -> muss als Text erscheinen
    expect(screen.getByText('A')).toBeInTheDocument();

    // 'Hallo' hat Länge > 1 -> muss als Icon erscheinen
    const wordIcon = screen.getByAltText('Wort');
    expect(wordIcon).toBeInTheDocument();
    expect(wordIcon).toHaveAttribute('src', 'word-icon-path');
  });

  it('zeigt einen Platzhalterpunkt für leere Frames an', () => {
    render(<FrameListSmsTextbild frames={testFrames} current={1} />);
    expect(screen.getByTitle('leer')).toHaveTextContent('·');
  });

  it('markiert das aktive Item mit der Klasse "edit"', () => {
    render(<FrameListSmsTextbild frames={testFrames} current={0} />);
    
    // Laut mockIsItemActive ist das erste Element (Index 0,0) aktiv
    const firstItem = screen.getByText('A').closest('li');
    expect(firstItem).toHaveClass('edit');
  });

  it('ruft onSelect auf, wenn eine Frame-Gruppe geklickt wird', () => {
    const mockOnSelect = vi.fn();
    render(<FrameListSmsTextbild frames={testFrames} current={0} onSelect={mockOnSelect} />);

    // Klick auf die Liste (ul) des zweiten Frames
    const secondFrame = screen.getAllByRole('list')[1];
    fireEvent.click(secondFrame);

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('toggelt ein Item, wenn es im aktuellen Frame angeklickt wird', () => {
    render(<FrameListSmsTextbild frames={testFrames} current={0} />);

    const itemA = screen.getByText('A');
    fireEvent.click(itemA);

    // toggleItem muss für Frame 0, Item 0 aufgerufen worden sein
    expect(mockToggleItem).toHaveBeenCalledWith(0, 0);
  });
});