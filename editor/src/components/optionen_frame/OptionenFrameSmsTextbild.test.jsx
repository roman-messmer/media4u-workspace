import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptionenFrameSmsTextbild from './OptionenFrameSmsTextbild';

// 1. Robuster Mock für ResizeObserver (muss ein Konstruktor sein)
global.ResizeObserver = vi.fn().mockImplementation(function() {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
});

// 2. Mock für den UI-Toggle Context
const mockToggleStrapi = vi.fn();
vi.mock('../../context/UiToggleContext', () => ({
  useUiToggles: () => ({
    showStrapiSMSTextbild: false,
    toggleStrapiSMSTextbild: mockToggleStrapi,
  }),
}));

// 3. Mocks für SVG-Icons
vi.mock('../../assets/newspaper.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/clone.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/trash-can.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/floppy-disk.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/code.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/arrow-up.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/arrow-down.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/chevron-left.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/chevron-right.svg', () => ({ default: 'icon' }));
vi.mock('../../assets/strapi.svg', () => ({ default: 'icon' }));

describe('OptionenFrameSmsTextbild Komponente', () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rendert die Toolbar mit allen konfigurierten Buttons', () => {
    render(<OptionenFrameSmsTextbild onAction={mockOnAction} />);
    expect(screen.getByTitle('Neuer Frame')).toBeInTheDocument();
    expect(screen.getByTitle('Speichern')).toBeInTheDocument();
    expect(screen.getByTitle('Strapi anzeigen')).toBeInTheDocument();
  });

  it('ruft onAction auf, wenn ein Standard-Button geklickt wird', () => {
    render(<OptionenFrameSmsTextbild onAction={mockOnAction} />);
    fireEvent.click(screen.getByTitle('Neuer Frame'));
    expect(mockOnAction).toHaveBeenCalledWith('new');
  });

  it('ruft toggleStrapiSMSTextbild auf, wenn der Strapi-Button geklickt wird', () => {
    render(<OptionenFrameSmsTextbild onAction={mockOnAction} />);
    fireEvent.click(screen.getByTitle('Strapi anzeigen'));
    expect(mockToggleStrapi).toHaveBeenCalled();
  });

  it('öffnet den Bestätigungsdialog beim Klicken auf Löschen', () => {
    render(<OptionenFrameSmsTextbild onAction={mockOnAction} />);
    fireEvent.click(screen.getByTitle('Löschen'));
    expect(screen.getByText(/Soll das Frame Element wirklich gelöscht werden/i)).toBeInTheDocument();
  });

  it('führt die Lösch-Aktion aus, wenn im Dialog "Ja" geklickt wird', () => {
    render(<OptionenFrameSmsTextbild onAction={mockOnAction} />);
    fireEvent.click(screen.getByTitle('Löschen'));
    fireEvent.click(screen.getByRole('button', { name: /Ja/i }));
    expect(mockOnAction).toHaveBeenCalledWith('delete');
  });
});