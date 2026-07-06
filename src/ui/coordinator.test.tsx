// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoordinatorConsole } from './CoordinatorConsole';
import { decodeEnvelope, encodeEnvelope } from '../adapters/envelopeCodec';
import { utf8Encode } from '../shared/utf8';
import { unwrap } from '../domain/fixtures';
import { makeDeps } from './testSupport';

afterEach(cleanup);

async function createWorkflowInUi(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Title'), 'Q3 risks');
  await user.type(screen.getByLabelText(/participants/i), 'Ana{enter}Ben{enter}Cyn');
  await user.click(screen.getByRole('button', { name: 'Create workflow' }));
}

describe('CoordinatorConsole', () => {
  it('runs the canonical round: create, draft, issue, import, consolidate', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);

    // Create — participants appear.
    await createWorkflowInUi(user);
    expect(await screen.findByText('Ana')).toBeTruthy();
    expect(screen.getByText('Cyn')).toBeTruthy();

    // Draft round 1.
    await user.type(screen.getByLabelText('Prompt'), 'List the top risks');
    await user.click(screen.getByRole('button', { name: 'Draft round' }));
    expect(await screen.findByText(/round 1/i)).toBeTruthy();

    // Issue — one link + one password per participant, shown once.
    await user.click(screen.getByRole('button', { name: 'Issue round' }));
    const links = (await screen.findAllByRole('link', {
      name: /invitation link/i,
    })) as HTMLAnchorElement[];
    expect(links).toHaveLength(3);
    expect(screen.getByText('secret-pw-1')).toBeTruthy();
    expect(screen.getByText('secret-pw-3')).toBeTruthy();
    expect(document.querySelector('svg')).toBeTruthy(); // QR carrier

    // Contributors respond (fake crypto; route lifted from each link's envelope).
    const answers = [
      ['Vendor lock-in', 'burnout'],
      ['vendor  lock-in', 'scope creep'],
      ['Burnout'],
    ];
    for (const [i, link] of links.entries()) {
      const invitation = unwrap(decodeEnvelope(link.href.split('#')[1] ?? ''));
      const response = await deps.crypto.seal({
        plaintext: utf8Encode(JSON.stringify({ items: answers[i] })),
        password: `secret-pw-${i + 1}`,
        route: invitation.header,
      });
      await user.clear(screen.getByLabelText(/paste a response envelope/i));
      await user.click(screen.getByLabelText(/paste a response envelope/i));
      await user.paste(encodeEnvelope(response));
      await user.click(screen.getByRole('button', { name: 'Import response' }));
    }
    expect(await screen.findByText(/3 of 3 responses/i)).toBeTruthy();

    // Consolidate — passwords re-entered, output appears, round closes.
    await user.type(screen.getByLabelText('Password for Ana'), 'secret-pw-1');
    await user.type(screen.getByLabelText('Password for Ben'), 'secret-pw-2');
    await user.type(screen.getByLabelText('Password for Cyn'), 'secret-pw-3');
    await user.click(screen.getByRole('button', { name: 'Run consolidation' }));

    expect(await screen.findByText('Burnout')).toBeTruthy();
    expect(screen.getByText('Vendor lock-in')).toBeTruthy();
    expect(screen.getByText('scope creep')).toBeTruthy();
    expect(screen.getByText(/closed/i)).toBeTruthy();

    // The next round can be drafted.
    expect(screen.getByLabelText('Prompt')).toBeTruthy();
  });

  it('surfaces import errors without losing state', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);
    await createWorkflowInUi(user);
    await user.type(await screen.findByLabelText('Prompt'), 'p');
    await user.click(screen.getByRole('button', { name: 'Draft round' }));
    await user.click(await screen.findByRole('button', { name: 'Issue round' }));

    await user.click(await screen.findByLabelText(/paste a response envelope/i));
    await user.paste('garbage');
    await user.click(screen.getByRole('button', { name: 'Import response' }));
    expect(await screen.findByText(/not a valid envelope/i)).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /invitation link/i })).toHaveLength(3);
  });

  it('runs a Rank round to a ranked outcome', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);
    await user.type(screen.getByLabelText('Title'), 'Priorities');
    await user.type(screen.getByLabelText(/participants/i), 'Ana{enter}Ben');
    await user.click(screen.getByRole('button', { name: 'Create workflow' }));

    // The Score branch renders its scale inputs; then switch to Rank.
    await user.selectOptions(await screen.findByLabelText('Question type'), 'Score');
    expect(screen.getByLabelText('Scale min')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Question type'), 'Rank');

    await user.type(screen.getByLabelText('Prompt'), 'Rank these risks');
    await user.type(screen.getByLabelText(/items \(one per line\)/i), 'burnout{enter}lock-in');
    await user.click(screen.getByRole('button', { name: 'Draft round' }));
    await user.click(await screen.findByRole('button', { name: 'Issue round' }));

    const links = (await screen.findAllByRole('link', {
      name: /invitation link/i,
    })) as HTMLAnchorElement[];
    expect(links).toHaveLength(2);

    for (const [i, link] of links.entries()) {
      const invitation = unwrap(decodeEnvelope(link.href.split('#')[1] ?? ''));
      const response = await deps.crypto.seal({
        plaintext: utf8Encode(JSON.stringify({ ranking: ['lock-in', 'burnout'] })),
        password: `secret-pw-${i + 1}`,
        route: invitation.header,
      });
      await user.clear(screen.getByLabelText(/paste a response envelope/i));
      await user.click(screen.getByLabelText(/paste a response envelope/i));
      await user.paste(encodeEnvelope(response));
      await user.click(screen.getByRole('button', { name: 'Import response' }));
    }

    await user.type(await screen.findByLabelText('Password for Ana'), 'secret-pw-1');
    await user.type(screen.getByLabelText('Password for Ben'), 'secret-pw-2');
    await user.click(screen.getByRole('button', { name: 'Run consolidation' }));

    expect(await screen.findByText('lock-in')).toBeTruthy();
    const output = document.querySelector('ol.output');
    expect(output?.textContent).toMatch(/lock-in.*burnout/);
  });

  it('re-issues invitations to non-respondents with fresh passwords', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);
    await createWorkflowInUi(user);
    await user.type(await screen.findByLabelText('Prompt'), 'p');
    await user.click(screen.getByRole('button', { name: 'Draft round' }));
    await user.click(await screen.findByRole('button', { name: 'Issue round' }));
    const links = (await screen.findAllByRole('link', {
      name: /invitation link/i,
    })) as HTMLAnchorElement[];
    expect(links).toHaveLength(3);

    // Ana responds; then the coordinator re-keys the round for the other two.
    const invitation = unwrap(decodeEnvelope(links[0]?.href.split('#')[1] ?? ''));
    const response = await deps.crypto.seal({
      plaintext: utf8Encode(JSON.stringify({ items: ['a'] })),
      password: 'secret-pw-1',
      route: invitation.header,
    });
    await user.click(screen.getByLabelText(/paste a response envelope/i));
    await user.paste(encodeEnvelope(response));
    await user.click(screen.getByRole('button', { name: 'Import response' }));
    await screen.findByText(/1 of 3 responses/i);

    await user.click(screen.getByRole('button', { name: 'Re-issue invitations' }));
    expect(await screen.findByText('secret-pw-4')).toBeTruthy();
    expect(screen.getByText('secret-pw-5')).toBeTruthy();
    expect(screen.queryByText('secret-pw-1')).toBeNull();
    expect(screen.getAllByRole('link', { name: /invitation link/i })).toHaveLength(2);
  });

  it('cancels a stuck round and returns to drafting', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);
    await createWorkflowInUi(user);
    await user.type(await screen.findByLabelText('Prompt'), 'p');
    await user.click(screen.getByRole('button', { name: 'Draft round' }));
    await user.click(await screen.findByRole('button', { name: 'Issue round' }));

    await user.click(await screen.findByRole('button', { name: 'Cancel round' }));
    expect(await screen.findByText(/cancelled/i)).toBeTruthy();
    expect(screen.getByLabelText('Prompt')).toBeTruthy();
  });

  it('exports a workflow and imports it into a fresh console', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    const { unmount } = render(<CoordinatorConsole deps={deps} />);
    await createWorkflowInUi(user);
    await screen.findByText('Ana');

    // jsdom has no URL.createObjectURL, so export falls back to copyable text.
    await user.click(screen.getByRole('button', { name: 'Export workflow' }));
    const exported = (await screen.findByLabelText(/exported workflow/i)) as HTMLTextAreaElement;
    expect(exported.value).toContain('Q3 risks');
    unmount();

    const fresh = makeDeps();
    render(<CoordinatorConsole deps={fresh} />);
    await user.click(screen.getByLabelText(/import a workflow/i));
    await user.paste(exported.value);
    await user.click(screen.getByRole('button', { name: 'Import workflow' }));
    expect(await screen.findByRole('heading', { name: 'Q3 risks' })).toBeTruthy();
    expect((await fresh.repo.list()).map((w) => w.title)).toEqual(['Q3 risks']);
  });

  it('loads a demo workflow into an empty console so the loop is visible immediately', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);

    await user.click(await screen.findByRole('button', { name: 'Load the demo workflow' }));
    expect(await screen.findByRole('heading', { name: /demo/i })).toBeTruthy();
    // All three closed rounds of the canonical loop are on screen…
    expect(screen.getByText(/round 1 — closed/i)).toBeTruthy();
    expect(screen.getByText(/round 3 — closed/i)).toBeTruthy();
    // …ending in a ranked outcome, and the next round is ready to draft.
    expect(document.querySelectorAll('.output').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByLabelText('Prompt')).toBeTruthy();
    // The offer disappears once a workflow exists.
    expect(screen.queryByRole('button', { name: 'Load the demo workflow' })).toBeNull();
  });

  it('supports a subset audience for later rounds', async () => {
    const deps = makeDeps();
    const user = userEvent.setup();
    render(<CoordinatorConsole deps={deps} />);
    await createWorkflowInUi(user);
    await user.type(await screen.findByLabelText('Prompt'), 'p');
    await user.click(screen.getByLabelText('Cyn', { selector: 'input' }));
    await user.click(screen.getByRole('button', { name: 'Draft round' }));
    await user.click(await screen.findByRole('button', { name: 'Issue round' }));
    expect(await screen.findAllByRole('link', { name: /invitation link/i })).toHaveLength(2);
  });
});
