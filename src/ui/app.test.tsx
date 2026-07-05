// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from '../App';
import { encodeEnvelope } from '../adapters/envelopeCodec';
import { utf8Encode } from '../shared/utf8';
import { FakeCryptoService, makeDeps } from './testSupport';

afterEach(cleanup);

describe('App routing by URL fragment', () => {
  it('shows the coordinator console when there is no fragment', () => {
    render(<App deps={makeDeps()} initialHash="" />);
    expect(screen.getByRole('heading', { name: 'Synergon' })).toBeTruthy();
    expect(screen.getByLabelText('Title')).toBeTruthy();
  });

  it('shows the contributor view when the fragment is an envelope', async () => {
    const envelope = await new FakeCryptoService().seal({
      plaintext: utf8Encode(JSON.stringify({ instruction: 'p', expects: 'ItemList' })),
      password: 'pw',
      route: { workflowId: 'w-1', roundId: 'r-1', participantId: 'p-1' },
    });
    render(<App deps={makeDeps()} initialHash={`#${encodeEnvelope(envelope)}`} />);
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.queryByLabelText('Title')).toBeNull();
  });

  it('explains when the fragment is not a valid envelope', () => {
    render(<App deps={makeDeps()} initialHash="#garbage" />);
    expect(screen.getByText(/not a valid Synergon envelope/i)).toBeTruthy();
  });
});
