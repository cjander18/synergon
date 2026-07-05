import { describe, it, expect } from 'vitest';
import { WebCryptoService } from './webCryptoService';
import { CopyPasteChannel } from './copyPasteChannel';
import { encodeEnvelope } from './envelopeCodec';
import { reduce } from '../domain/reducer';
import { apply, baseWorkflow, draftRound, expectErr, issueToAll, unwrap } from '../domain/fixtures';

// M2 exit criterion: a prompt encrypts to an envelope and decrypts back only
// with the correct password; a returned response self-routes by its
// authenticated header — straight into the M1 reducer.
describe('envelope round trip: coordinator -> contributor -> coordinator', () => {
  const cryptoService = new WebCryptoService({ iterations: 1_000 });
  const baseUrl = 'https://synergon.local/app';

  it('carries a prompt out and a response back through the channel', async () => {
    // Dana issues the round in the domain, then seals the prompt for p-1.
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'));

    const outbound = await cryptoService.seal({
      plaintext: new TextEncoder().encode('List the top risks'),
      password: 'sam-password',
      route: { workflowId: workflow.id, roundId: 'r-1', participantId: 'p-1' },
    });
    const handle = await new CopyPasteChannel(baseUrl).publish(outbound);
    expect(handle.kind).toBe('url');

    // Sam opens the link, decrypts with the out-of-band password, answers,
    // and seals the response under the same route.
    const inboundChannel = new CopyPasteChannel(baseUrl);
    const received = unwrap(inboundChannel.accept(handle.kind === 'url' ? handle.url : ''));
    expect(new TextDecoder().decode(unwrap(await cryptoService.open(received, 'sam-password')))).toBe(
      'List the top risks',
    );

    const response = await cryptoService.seal({
      plaintext: new TextEncoder().encode(JSON.stringify({ items: ['vendor lock-in'] })),
      password: 'sam-password',
      route: received.header,
    });

    // Dana imports the pasted response; the authenticated header routes it.
    const danaChannel = new CopyPasteChannel(baseUrl);
    danaChannel.accept(encodeEnvelope(response));
    const [collected] = await danaChannel.collect();
    expect(collected).toBeDefined();
    if (!collected) return;

    workflow = apply(workflow, {
      kind: 'ImportResponse',
      response: {
        roundId: collected.header.roundId,
        participantId: collected.header.participantId,
        envelope: collected,
      },
    });
    expect(workflow.rounds[0]?.status).toBe('Collecting');
    expect(workflow.rounds[0]?.responses[0]?.participantId).toBe('p-1');
  });

  it('a header naming a participant outside the audience is rejected on import', async () => {
    let workflow = unwrap(
      reduce(baseWorkflow(), {
        kind: 'DraftRound',
        round: {
          id: 'r-1',
          audience: { kind: 'Subset', participantIds: ['p-1'] },
          elicitation: { kind: 'ItemList', prompt: 'p' },
          aggregation: { kind: 'Deduplicate' },
        },
      }),
    );
    workflow = apply(workflow, {
      kind: 'IssueRound',
      roundId: 'r-1',
      invitations: [
        {
          roundId: 'r-1',
          participantId: 'p-1',
          envelope: await cryptoService.seal({
            plaintext: new TextEncoder().encode('p'),
            password: 'pw',
            route: { workflowId: 'w-1', roundId: 'r-1', participantId: 'p-1' },
          }),
        },
      ],
    });

    const stray = await cryptoService.seal({
      plaintext: new TextEncoder().encode('{}'),
      password: 'pw',
      route: { workflowId: 'w-1', roundId: 'r-1', participantId: 'p-2' },
    });
    const result = reduce(workflow, {
      kind: 'ImportResponse',
      response: {
        roundId: stray.header.roundId,
        participantId: stray.header.participantId,
        envelope: stray,
      },
    });
    expect(expectErr(result)).toMatch(/audience/i);
  });
});
