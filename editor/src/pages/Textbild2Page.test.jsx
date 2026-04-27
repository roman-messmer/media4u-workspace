import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Textbild2Page from './Textbild2Page';

// ResizeObserver Mock für die enthaltenen Toolbars
global.ResizeObserver = vi.fn().mockImplementation(function() {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
});

const mockSaveNow = vi.fn();
const mockSetState = vi.fn();

vi.mock('../utils/usePersistentEditor', () => ({
  usePersistentEditor: () => ({
    state: { frames: [[{ text: 'Start', col: 1, row: 1, classes: ['zeilen4'] }]], current: 0 },
    setState: (updater) => {
      if (typeof updater === 'function') {
        mockSetState(updater({ frames: [[{ text: 'Start', col: 1, row: 1 }]], current: 0 }));
      } else {
        mockSetState(updater);
      }
    },
    saveNow: mockSaveNow
  })
}));

vi.mock('../components/optionen_frame/OptionenFrameTextbild2', () => ({
  default: ({ onAction }) => (
    <button onClick={() => onAction('new')} data-testid="btn-new-frame">New Frame</button>
  )
}));

vi.mock('../components/optionen_pre/OptionenPre', () => ({
  default: ({ onAction }) => (
    <button onClick={() => onAction('down')} data-testid="btn-move-down">Move Down</button>
  )
}));

describe('Textbild2Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <figure class="textbild2">
        <div class="display">
          <div class="frame show">
            <pre class="active">Start</pre>
          </div>
        </div>
      </figure>
      <div class="wrapper_frame_list">
        <div class="frame_list">
          <ul class="frame_group show">
            <li class="edit">Start</li>
          </ul>
        </div>
      </div>
    `;
  });

  it('erzeugt einen neuen Frame bei entsprechender Action', () => {
    render(<Textbild2Page />);
    fireEvent.click(screen.getByTestId('btn-new-frame'));
    expect(mockSetState).toHaveBeenCalledWith(expect.objectContaining({ current: 1 }));
  });

  it('verschiebt ein Element nach unten (Move Down Logic)', () => {
    render(<Textbild2Page />);
    fireEvent.click(screen.getByTestId('btn-move-down'));
    expect(mockSetState).toHaveBeenCalledWith(expect.objectContaining({
      frames: expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ row: 2 })
        ])
      ])
    }));
  });
});