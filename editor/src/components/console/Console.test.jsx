import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Console from './Console';

describe('Console Steuerung', () => {
  const mockHandlers = {
    onPrev: vi.fn(),
    onRestart: vi.fn(),
    onStop: vi.fn(),
    onNext: vi.fn(),
  };

  it('deaktiviert Prev und Restart Buttons beim ersten Frame', () => {
    render(<Console {...mockHandlers} current={0} last={5} />);
    
    expect(screen.getByLabelText('Frame zurück')).toBeDisabled();
    expect(screen.getByLabelText('Animation neu starten')).toBeDisabled();
    expect(screen.getByLabelText('Frame weiter')).not.toBeDisabled();
  });

  it('deaktiviert Next und Stop Buttons beim letzten Frame', () => {
    render(<Console {...mockHandlers} current={5} last={5} />);
    
    expect(screen.getByLabelText('Frame weiter')).toBeDisabled();
    expect(screen.getByLabelText('Animation beenden')).toBeDisabled();
    expect(screen.getByLabelText('Frame zurück')).not.toBeDisabled();
  });

  it('ruft die korrekten Handler beim Klick auf', () => {
    render(<Console {...mockHandlers} current={1} last={5} />);
    
    fireEvent.click(screen.getByLabelText('Frame weiter'));
    expect(mockHandlers.onNext).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Frame zurück'));
    expect(mockHandlers.onPrev).toHaveBeenCalled();
  });

  it('nutzt das übergebene aria-label korrekt', () => {
    const customLabel = "Spezielle SMS Konsole";
    render(<Console {...mockHandlers} label={customLabel} />);
    
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', customLabel);
  });
});