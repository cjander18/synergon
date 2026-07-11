// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from './CopyButton';

afterEach(cleanup);

describe('CopyButton', () => {
  it('copies the text and confirms transiently', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<CopyButton text="secret-pw-1" label="Copy password" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy password' }));
    expect(writeText).toHaveBeenCalledWith('secret-pw-1');
    expect(await screen.findByRole('button', { name: 'Copied ✓' })).toBeTruthy();
  });

  it('degrades to a visible prompt when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    render(<CopyButton text="abc" label="Copy link" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(await screen.findByRole('button', { name: /copy manually/i })).toBeTruthy();
  });
});
