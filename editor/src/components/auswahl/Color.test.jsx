import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Color from './Color';

// Wir fangen den Farbbefehl ab
const mockSetColor = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({ setColorForActiveItems: mockSetColor }),
  COLOR_CLASSES: ['red', 'blue'],
  COLOR_CLASS_MAP: { 'red': 'red', 'blue': 'blue' }
}));

describe('Color Werkzeug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rendert Farbbtons und feuert setColorForActiveItems bei Klick', () => {
    render(<Color />);
    const redButton = screen.getByTitle('red');
    
    expect(redButton).toBeInTheDocument();
    
    fireEvent.click(redButton);
    expect(mockSetColor).toHaveBeenCalledWith('red');
  });
});