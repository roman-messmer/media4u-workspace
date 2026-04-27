import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Zeichen from './Zeichen';

const mockSetText = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({
    current: 0,
    activeStamp: 0,
    getPrimaryActiveText: () => 'SMS Init',
    setTextForActiveItems: mockSetText
  })
}));

describe('Zeichen Werkzeug (SMS)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fügt ein Zeichen in den Text ein und aktualisiert den Context', () => {
    render(<Zeichen />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe('SMS Init');

    // Button A suchen
    const aButton = screen.getByRole('button', { name: 'Zeichen A' });
    fireEvent.click(aButton);

    // Context muss gefeuert werden
    expect(mockSetText).toHaveBeenCalled();
  });
});