// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AppErrorBoundary } from './AppErrorBoundary';

afterEach(cleanup);

function Bomb(): never {
  throw new Error('kaboom');
}

describe('AppErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <AppErrorBoundary>
        <p>all fine</p>
      </AppErrorBoundary>,
    );
    expect(screen.getByText('all fine')).toBeTruthy();
  });

  it('replaces a crash with a recovery screen instead of a blank page', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    );
    silence.mockRestore();

    expect(screen.getByText(/something went wrong in Synergon/i)).toBeTruthy();
    expect(screen.getByText(/your data is still in this browser/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /email/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
    expect(screen.getByText(/kaboom/)).toBeTruthy(); // the error, for the report
  });
});
