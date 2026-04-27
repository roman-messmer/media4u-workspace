import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SmsTextbild from './SmsTextbild';

// Wir mocken das Display, da es bereits eigene Tests hat
vi.mock('../display/DisplaySmsTextbild', () => ({
  default: () => <div data-testid="mock-display">Mock Display</div>
}));

describe('SmsTextbild Wrapper', () => {
  it('rendert den Wrapper mit korrektem aria-label und Kind-Komponente', () => {
    render(<SmsTextbild />);
    
    // Prüft den Wrapper-Container
    const wrapper = screen.getByLabelText('SMS-Textbild');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('sms_textbild');
    
    // Prüft, ob das Display-Kind gerendert wurde
    expect(screen.getByTestId('mock-display')).toBeInTheDocument();
  });
});