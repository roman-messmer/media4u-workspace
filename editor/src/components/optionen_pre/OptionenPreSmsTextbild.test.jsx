import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptionenPreSmsTextbild from './OptionenPreSmsTextbild';

// 1. Mock für die UI-Toggles (verhindert den Provider-Fehler)
vi.mock('../../context/UiToggleContext', () => ({
  useUiToggles: () => ({
    showZeichenSms: false,
    toggleZeichenSms: vi.fn()
  })
}));

// 2. Mock für Assets
vi.mock('../../assets/file-lines.svg', () => ({ default: 'file-icon' }));
vi.mock('../../assets/clone.svg', () => ({ default: 'clone-icon' }));
vi.mock('../../assets/trash-can.svg', () => ({ default: 'trash-icon' }));

const mockOnAction = vi.fn();

describe('OptionenPreSmsTextbild', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // DOM säubern
    document.body.innerHTML = '';
  });

  it('zeigt den InfoDialog, wenn ohne Auswahl geklont wird', () => {
    render(<OptionenPreSmsTextbild onAction={mockOnAction} />);
    
    // Den Klonen-Button klicken (id: clone, label: Pre duplizieren)
    const cloneBtn = screen.getByLabelText('Pre duplizieren');
    fireEvent.click(cloneBtn);
    
    // Es sollte der InfoDialog mit dem Hinweis erscheinen
    expect(screen.getByText(/Nichts ausgewählt/i)).toBeInTheDocument();
  });

  it('öffnet den ConfirmDialog beim Löschen mit Selektion', () => {
    // Simulation einer aktiven Selektion im DOM (Schnittmenge aus Display und Liste)
    document.body.innerHTML = `
      <div id="root"></div>
      <figure class="sms_textbild">
        <div class="display">
          <div class="frame show">
            <pre class="active" data-index="0"></pre>
          </div>
        </div>
      </figure>
      <div class="frame_list">
        <ul class="frame_group show">
          <li class="edit"></li>
        </ul>
      </div>
    `;

    render(<OptionenPreSmsTextbild onAction={mockOnAction} />);
    
    const deleteBtn = screen.getByLabelText('Löschen');
    fireEvent.click(deleteBtn);
    
    // Da eine Selektion da ist, muss der ConfirmDialog (Ja/Nein) kommen
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/wirklich gelöscht werden/i)).toBeInTheDocument();
  });
});