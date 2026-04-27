import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuellcodeTextbild2 from './QuellcodeTextbild2';

describe('QuellcodeTextbild2 Serialisierung', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('zeigt eine Meldung an, wenn keine Frames gefunden werden', async () => {
    document.body.innerHTML = `<figure class="textbild2"><div class="display"></div></figure>`;
    render(<QuellcodeTextbild2 isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Keine .frame Elemente gefunden'))).toBeInTheDocument();
    });
  });

  it('reagiert auf Änderungen im DOM (MutationObserver)', async () => {
    document.body.innerHTML = `
      <figure class="textbild2">
        <div class="display">
          <div class="frame show">
            <pre class="zeilen4" data-gridrow="1" data-gridcol="1">Start</pre>
          </div>
        </div>
      </figure>
    `;

    render(<QuellcodeTextbild2 isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      const codeBox = screen.getByRole('region').querySelector('code');
      expect(codeBox.textContent).toContain('Start');
    });

    const pre = document.querySelector('pre');
    pre.textContent = 'Geändert';
    
    await waitFor(() => {
      const codeBox = screen.getByRole('region').querySelector('code');
      expect(codeBox.textContent).toContain('Geändert');
    });
  });
});