import { Component } from 'react';
import type { ReactNode } from 'react';

// A render crash must never be a blank page: workflows live only in this
// browser, so the user needs to know their data is safe and how to tell us.
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | undefined }
> {
  override state: { error: Error | undefined } = { error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override render() {
    if (this.state.error === undefined) return this.props.children;
    const subject = encodeURIComponent('Synergon crash report');
    const body = encodeURIComponent(
      `What were you doing when it crashed?\n\n\n—\nError: ${this.state.error.message}`,
    );
    return (
      <main className="page">
        <h1>Synergon</h1>
        <p role="alert">Something went wrong in Synergon and this screen could not continue.</p>
        <p>
          Your data is still in this browser — nothing is lost. Reloading usually recovers; if it
          keeps happening, please{' '}
          <a href={`mailto:synergonlabs@gmail.com?subject=${subject}&body=${body}`}>
            email us the details
          </a>
          .
        </p>
        <p className="hint">
          Error: <code>{this.state.error.message}</code>
        </p>
        <button className="primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </main>
    );
  }
}
