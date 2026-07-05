// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContributorView } from './ContributorView';
import { decodeEnvelope } from '../adapters/envelopeCodec';
import { utf8Decode, utf8Encode } from '../shared/utf8';
import { unwrap } from '../domain/fixtures';
import { FakeCryptoService } from './testSupport';

afterEach(cleanup);

const crypto = new FakeCryptoService();

async function invitation(maxItems?: number) {
  return crypto.seal({
    plaintext: utf8Encode(
      JSON.stringify({
        instruction: 'List the top risks',
        expects: 'ItemList',
        ...(maxItems === undefined ? {} : { maxItems }),
      }),
    ),
    password: 'pw-1',
    route: { workflowId: 'w-1', roundId: 'r-1', participantId: 'p-1' },
  });
}

describe('ContributorView', () => {
  it('states the anonymity boundary in plain language before unlocking', async () => {
    render(<ContributorView crypto={crypto} envelope={await invitation()} />);
    expect(screen.getByText(/anonymous to other participants/i)).toBeTruthy();
    expect(screen.getByText(/coordinator.*knows/i)).toBeTruthy();
  });

  it('rejects a wrong password with an explanation', async () => {
    render(<ContributorView crypto={crypto} envelope={await invitation()} />);
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Unlock' }));
    expect(await screen.findByText(/wrong password/i)).toBeTruthy();
  });

  it('decrypts the prompt and produces an encrypted response envelope', async () => {
    render(<ContributorView crypto={crypto} envelope={await invitation()} />);
    await userEvent.type(screen.getByLabelText('Password'), 'pw-1');
    await userEvent.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(await screen.findByText('List the top risks')).toBeTruthy();
    await userEvent.type(
      screen.getByLabelText(/your answer/i),
      'vendor lock-in{enter}burnout{enter}{enter}',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Encrypt response' }));

    const output = (await screen.findByLabelText(
      /your encrypted response/i,
    )) as HTMLTextAreaElement;
    const envelope = unwrap(decodeEnvelope(output.value));
    expect(envelope.header).toMatchObject({ workflowId: 'w-1', roundId: 'r-1', participantId: 'p-1' });
    expect(JSON.parse(utf8Decode(unwrap(await crypto.open(envelope, 'pw-1'))))).toEqual({
      items: ['vendor lock-in', 'burnout'],
    });
  });

  it('enforces the round limits before encrypting', async () => {
    render(<ContributorView crypto={crypto} envelope={await invitation(1)} />);
    await userEvent.type(screen.getByLabelText('Password'), 'pw-1');
    await userEvent.click(screen.getByRole('button', { name: 'Unlock' }));
    await userEvent.type(await screen.findByLabelText(/your answer/i), 'a{enter}b');
    await userEvent.click(screen.getByRole('button', { name: 'Encrypt response' }));
    expect(await screen.findByText(/at most 1/i)).toBeTruthy();
    expect(screen.queryByLabelText(/your encrypted response/i)).toBeNull();
  });
});
