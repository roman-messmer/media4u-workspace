import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpiegelnDrehen from './SpiegelnDrehen';

const mockSetRotate = vi.fn();

vi.mock('../../context/FrameNavContext', () => ({
  useFrameNav: () => ({ setRotateForActiveItems: mockSetRotate }),
  isRotateClass: () => false,
  makeRotateClass: () => 'drehen_0'
}));

describe('SpiegelnDrehen Werkzeug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sendet den korrekten Spiegeln-Befehl an den Context', () => {
    render(<SpiegelnDrehen />);
    
    const flipButton = screen.getByText('Horizontal spiegeln');
    fireEvent.click(flipButton);
    
    // Erwartet: deg bleibt 0, flip wird true
    expect(mockSetRotate).toHaveBeenCalledWith({ deg: 0, flip: true });
  });
});