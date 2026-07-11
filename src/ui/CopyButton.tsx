import { useEffect, useRef, useState } from 'react';

// One-click copy for the critical hand-off path (links, passwords, response
// envelopes). Clipboard access is an explicit user action; where the API is
// unavailable (http, permissions) the label tells the user to copy by hand.
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    if (navigator.clipboard === undefined) {
      setState('unavailable');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
      timer.current = setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('unavailable');
    }
  }

  return (
    <button type="button" className="copy" onClick={() => void copy()}>
      {state === 'idle' && label}
      {state === 'copied' && 'Copied ✓'}
      {state === 'unavailable' && 'Select and copy manually'}
    </button>
  );
}
