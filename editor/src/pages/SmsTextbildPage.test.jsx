import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SmsTextbildPage from './SmsTextbildPage';
import { FrameNavProvider } from '../context/FrameNavContext';
import { UiToggleProvider } from '../context/UiToggleContext';

// ResizeObserver Mock für die enthaltenen Toolbars
global.ResizeObserver = vi.fn().mockImplementation(function() {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
});

const mockSetAndSave = vi.fn();

vi.mock('../utils/usePersistentEditor', () => ({
  usePersistentEditor: (key, def) => ({
    state: def,
    setAndSave: mockSetAndSave,
    saveNow: vi.fn()
  })
}));

vi.mock('../components/optionen_pre/OptionenPreSmsTextbild', () => ({
  default: ({ onAction }) => (
    <button onClick={() => onAction('alignToggle', { indices: [0] })} data-testid="btn-align">Align</button>
  )
}));

describe('SmsTextbildPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => render(
    <UiToggleProvider>
      <FrameNavProvider>
        <SmsTextbildPage />
      </FrameNavProvider>
    </UiToggleProvider>
  );

  it('rendert das Display und die Toolbars', () => {
    renderPage();
    expect(screen.getByTestId('sms-page')).toBeInTheDocument();
  });

  it('schaltet die Zentrierung (center) eines Elements um', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('btn-align'));
    expect(mockSetAndSave).toHaveBeenCalledWith(expect.arrayContaining([
      expect.arrayContaining([
        expect.objectContaining({ center: true })
      ])
    ]));
  });
});