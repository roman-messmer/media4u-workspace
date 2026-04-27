import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OptionenFrame from './OptionenFrame';

// Wir mocken die schweren Kind-Komponenten, um nur die "Weiche" zu testen
vi.mock('./OptionenFrameSmsTextbild', () => ({
  default: ({ onAction }) => (
    <div data-testid="sms-toolbar">
      <button onClick={() => onAction('test-sms')}>SMS Action</button>
    </div>
  )
}));

vi.mock('./OptionenFrameTextbild2', () => ({
  default: ({ onAction }) => (
    <div data-testid="tb2-toolbar">
      <button onClick={() => onAction('test-tb2')}>TB2 Action</button>
    </div>
  )
}));

describe('OptionenFrame Weiche', () => {
  it('rendert die SMS-Toolbar bei variant="sms"', () => {
    render(<OptionenFrame variant="sms" />);
    expect(screen.getByTestId('sms-toolbar')).toBeInTheDocument();
    expect(screen.queryByTestId('tb2-toolbar')).not.toBeInTheDocument();
  });

  it('rendert die Textbild2-Toolbar bei variant="textbild2"', () => {
    render(<OptionenFrame variant="textbild2" />);
    expect(screen.getByTestId('tb2-toolbar')).toBeInTheDocument();
    expect(screen.queryByTestId('sms-toolbar')).not.toBeInTheDocument();
  });

  it('reicht die onAction-Prop korrekt an die Kinder weiter', () => {
    const mockAction = vi.fn();
    render(<OptionenFrame variant="textbild2" onAction={mockAction} />);
    
    // Klick auf den Button im Mock
    const btn = screen.getByText('TB2 Action');
    btn.click();
    
    expect(mockAction).toHaveBeenCalledWith('test-tb2');
  });
});