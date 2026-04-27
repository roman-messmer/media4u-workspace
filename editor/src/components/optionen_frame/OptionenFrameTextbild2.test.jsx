import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptionenFrameTextbild2 from './OptionenFrameTextbild2';

const mockOnAction = vi.fn();
const mockToggleStrapi = vi.fn();

vi.mock('../../context/UiToggleContext', () => ({
  useUiToggles: () => ({
    showStrapiTextbild2: false,
    toggleStrapiTextbild2: mockToggleStrapi,
  })
}));

describe('OptionenFrameTextbild2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'visible';
  });

  it('ruft onAction mit der korrekten ID auf', () => {
    render(<OptionenFrameTextbild2 onAction={mockOnAction} />);
    fireEvent.click(screen.getByLabelText('Neues Frame'));
    expect(mockOnAction).toHaveBeenCalledWith('new');
  });

  it('öffnet den ConfirmDialog beim Klick auf Löschen', () => {
    render(<OptionenFrameTextbild2 onAction={mockOnAction} />);
    fireEvent.click(screen.getByLabelText('Löschen'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('schließt den Dialog mit der Escape-Taste', async () => {
    render(<OptionenFrameTextbild2 onAction={mockOnAction} />);
    fireEvent.click(screen.getByLabelText('Löschen'));

    const dialog = screen.getByRole('alertdialog');
    const cancelBtn = screen.getByText('Nein');
    cancelBtn.focus(); // Fokus setzen für den Listener

    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});