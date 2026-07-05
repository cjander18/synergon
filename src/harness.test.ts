import { describe, it, expect } from 'vitest';

// M0: prove the test harness reports failures and passes (red -> green).
// Verified red at 1 + 1 === 3; now green. This is the harness smoke test;
// real behaviour arrives in M1 (domain core).
describe('test harness', () => {
  it('runs and reports pass/fail', () => {
    expect(1 + 1).toBe(2);
  });
});
