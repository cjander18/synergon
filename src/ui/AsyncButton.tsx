import { useState } from 'react';
import type { ReactNode } from 'react';

// Button for async actions: disables itself and swaps to a pending label while
// the action runs, so slow work (key derivation, sealing) can't double-submit.
export function AsyncButton({
  onPress,
  busyLabel,
  className,
  children,
}: {
  onPress: () => Promise<unknown>;
  busyLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      {...(className === undefined ? {} : { className })}
      disabled={busy}
      aria-busy={busy}
      onClick={() => {
        if (busy) return;
        setBusy(true);
        void onPress().finally(() => setBusy(false));
      }}
    >
      {busy ? busyLabel : children}
    </button>
  );
}
