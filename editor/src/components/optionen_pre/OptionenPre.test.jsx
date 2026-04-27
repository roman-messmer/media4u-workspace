import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptionenPre from './OptionenPre';

const mockSetShowZeichenSms = vi.fn();
const mockSetShowZeichenTextbild2 = vi.fn();

vi.mock('../../context/UiToggleContext', () => ({
  useUiToggles: () => ({
    showZeichenSms: true,
    setShowZeichenSms: mockSetShowZeichenSms,
    showZeichenTextbild2: true,
    setShowZeichenTextbild2: mockSetShowZeichenTextbild2,
  })
}));

// Mocks für die Toolbars und Panels
vi.mock('./OptionenPreSmsTextbild', () => ({ default: () => <div data-testid="sms-tools" /> }));
vi.mock('./OptionenPreTextbild2', () => ({ default: () => <div data-testid="tb2-tools" /> }));
vi.mock('../auswahl/Zeichen', () => ({ default: () => <div data-testid="sms-panel" /> }));
vi.mock('../auswahl/Zeichen2', () => ({ default: () => <div data-testid="tb2-panel" /> }));

describe('OptionenPre Weiche', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deaktiviert den falschen Variant-Zustand beim Wechsel auf SMS', () => {
    render(<OptionenPre variant="sms" />);
    // Bei SMS sollte das Textbild2-Zeichenpanel deaktiviert werden
    expect(mockSetShowZeichenTextbild2).toHaveBeenCalledWith(false);
  });

  it('rendert die SMS-Werkzeuge und das Panel korrekt', () => {
    render(<OptionenPre variant="sms" includePanel={true} />);
    expect(screen.getByTestId('sms-tools')).toBeInTheDocument();
    expect(screen.getByTestId('sms-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('tb2-tools')).not.toBeInTheDocument();
  });

  it('rendert die Textbild2-Werkzeuge und das Panel korrekt', () => {
    render(<OptionenPre variant="textbild2" includePanel={true} />);
    expect(screen.getByTestId('tb2-tools')).toBeInTheDocument();
    expect(screen.getByTestId('tb2-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('sms-tools')).not.toBeInTheDocument();
  });
});