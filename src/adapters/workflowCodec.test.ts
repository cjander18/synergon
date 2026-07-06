import { describe, it, expect } from 'vitest';
import { decodeWorkflow, encodeWorkflow } from './workflowCodec';
import { apply, baseWorkflow, draftRound, expectErr, fakeResponse, issueToAll, unwrap } from '../domain/fixtures';

describe('workflow codec (export/import)', () => {
  it('round-trips a workflow with binary envelope fields intact', () => {
    let workflow = apply(baseWorkflow(), draftRound('r-1'));
    workflow = apply(workflow, issueToAll(workflow, 'r-1'), {
      kind: 'ImportResponse',
      response: fakeResponse('r-1', 'p-1'),
    });
    const decoded = unwrap(decodeWorkflow(encodeWorkflow(workflow)));
    expect(decoded).toEqual(workflow);
    expect(decoded.rounds[0]?.invitations[0]?.envelope.ciphertext).toBeInstanceOf(Uint8Array);
  });

  it('rejects text that is not an exported workflow', () => {
    expect(expectErr(decodeWorkflow('not json'))).toMatch(/exported workflow/i);
    expect(expectErr(decodeWorkflow('{"v":1}'))).toMatch(/exported workflow/i);
  });

  it('rejects an unsupported export version', () => {
    const forged = encodeWorkflow(baseWorkflow()).replace('"v": 1', '"v": 99');
    expect(expectErr(decodeWorkflow(forged))).toMatch(/version/i);
  });
});
