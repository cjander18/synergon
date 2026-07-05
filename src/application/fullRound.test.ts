import { describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { IndexedDbWorkflowRepository } from '../adapters/indexedDbWorkflowRepository';
import { WebCryptoService } from '../adapters/webCryptoService';
import { CopyPasteChannel } from '../adapters/copyPasteChannel';
import { CryptoRandomIdGen, CryptoRandomPasswordGen } from '../adapters/randomGenerators';
import { createWorkflow } from './createWorkflow';
import { advanceRound } from './advanceRound';
import { issueRound } from './issueRound';
import { importResponse } from './importResponse';
import { runConsolidation } from './runConsolidation';
import { unwrap } from '../domain/fixtures';
import { utf8Decode, utf8Encode } from '../shared/utf8';

// M3 exit criterion: a full round is created, issued, imported, and
// consolidated through the use-cases on the real persistence adapter, and the
// state survives a reload.
describe('full round on IndexedDB', () => {
  it('create -> advance -> issue -> respond -> import -> consolidate -> reload', async () => {
    const factory = new IDBFactory();
    const cryptoService = new WebCryptoService({ iterations: 1_000 });
    const deps = {
      repo: new IndexedDbWorkflowRepository('full-round', factory),
      crypto: cryptoService,
      channel: new CopyPasteChannel('https://synergon.local/app'),
      idGen: new CryptoRandomIdGen(),
      passwordGen: new CryptoRandomPasswordGen(),
    };

    const workflow = unwrap(
      await createWorkflow(deps, { title: 'Q3 risks', participantLabels: ['Ana', 'Ben', 'Cyn'] }),
    );
    const drafted = unwrap(
      await advanceRound(deps, {
        workflowId: workflow.id,
        audience: { kind: 'All' },
        elicitation: { kind: 'ItemList', prompt: 'List the top risks', maxItems: 5 },
        aggregation: { kind: 'Deduplicate' },
      }),
    );
    const roundId = drafted.rounds[0]?.id;
    if (!roundId) throw new Error('round not drafted');

    const { invitations } = unwrap(await issueRound(deps, { workflowId: workflow.id, roundId }));
    expect(invitations).toHaveLength(3);

    const answers = [['Vendor lock-in', 'burnout'], ['vendor lock-in'], ['Burnout', 'scope creep']];
    for (const [i, invitation] of invitations.entries()) {
      // Contributor side: open the link, decrypt, answer, seal on the same route.
      const received = unwrap(
        new CopyPasteChannel('https://synergon.local/app').accept(
          invitation.handle.kind === 'url' ? invitation.handle.url : invitation.handle.contents,
        ),
      );
      const prompt = JSON.parse(
        utf8Decode(unwrap(await cryptoService.open(received, invitation.password))),
      ) as { instruction: string };
      expect(prompt.instruction).toBe('List the top risks');
      const response = await cryptoService.seal({
        plaintext: utf8Encode(JSON.stringify({ items: answers[i] })),
        password: invitation.password,
        route: received.header,
      });
      unwrap(await importResponse(deps, { workflowId: workflow.id, envelope: response }));
    }

    const passwords = new Map(invitations.map((inv) => [inv.participantId, inv.password]));
    const done = unwrap(
      await runConsolidation(deps, { workflowId: workflow.id, roundId, passwords }),
    );
    const output = done.rounds[0]?.output;
    expect(output?.kind).toBe('ItemPool');
    const items = output?.kind === 'ItemPool' ? output.items : [];
    expect(items.map((item) => item.toLowerCase()).sort()).toEqual([
      'burnout',
      'scope creep',
      'vendor lock-in',
    ]);

    // Reload: a fresh adapter over the same database sees the closed round.
    const reloaded = await new IndexedDbWorkflowRepository('full-round', factory).load(workflow.id);
    expect(reloaded).toEqual(done);
    expect(reloaded?.rounds[0]?.status).toBe('Closed');
  });
});
