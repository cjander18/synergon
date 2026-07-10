// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from '../App';
import { encodeEnvelope } from '../adapters/envelopeCodec';
import { utf8Encode } from '../shared/utf8';
import { baseWorkflow } from '../domain/fixtures';
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

  it('offers the feedback channels in the coordinator view', () => {
    render(<App deps={makeDeps()} initialHash="" />);
    const email = screen.getByRole('link', { name: 'Email us' }) as HTMLAnchorElement;
    expect(email.href.startsWith('mailto:synergonlabs@gmail.com')).toBe(true);
    expect(email.href).toContain('What%20were%20you%20trying%20to%20do');
    expect(screen.getByText('synergonlabs@gmail.com')).toBeTruthy();
    const issues = screen.getByRole('link', { name: /report a problem/i }) as HTMLAnchorElement;
    expect(issues.href).toContain('github.com/cjander18/synergon/issues');
  });

  it('offers the feedback channels in the contributor view', async () => {
    const envelope = await new FakeCryptoService().seal({
      plaintext: utf8Encode(JSON.stringify({ instruction: 'p', expects: 'ItemList' })),
      password: 'pw',
      route: { workflowId: 'w-1', roundId: 'r-1', participantId: 'p-1' },
    });
    render(<App deps={makeDeps()} initialHash={`#${encodeEnvelope(envelope)}`} />);
    expect(screen.getByRole('link', { name: 'Email us' })).toBeTruthy();
    expect(screen.getByText(/never sends anything anywhere on its own/i)).toBeTruthy();
  });

  it('opens the coordinator with the workflow from a #w= fragment selected', async () => {
    const deps = makeDeps();
    const workflow = baseWorkflow();
    await deps.repo.save(workflow);
    render(<App deps={deps} initialHash={`#w=${workflow.id}`} />);
    expect(await screen.findByRole('heading', { name: workflow.title })).toBeTruthy();
  });

  it('falls back to the plain console for an unknown workflow id', async () => {
    const deps = makeDeps();
    await deps.repo.save(baseWorkflow());
    render(<App deps={deps} initialHash="#w=ghost" />);
    // The console, not the invalid-envelope error page.
    expect(await screen.findByText('Quarterly risks')).toBeTruthy(); // nav chip
    expect(screen.queryByText(/not a valid Synergon envelope/i)).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Quarterly risks' })).toBeNull();
  });
});
