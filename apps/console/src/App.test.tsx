import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';

describe('Console foundation', () => {
  it('renders the honest foundation state with no business forms', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A clear foundation.');
    expect(screen.getByText('control-api')).toBeInTheDocument();
    expect(screen.getByText('gateway-api')).toBeInTheDocument();
    expect(screen.getByText('console')).toBeInTheDocument();
    expect(
      screen.getByText(/Sign-in, provider connections and inference will arrive/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('provides a skip link and an operable mobile navigation toggle', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('link', { name: 'Components' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no automated accessibility violations detectable without layout', async () => {
    const { container } = render(<App />);
    // jsdom has no layout/canvas; real browser contrast/layout checks are separate.
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
