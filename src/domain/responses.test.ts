import { describe, it, expect } from 'vitest';
import { deidentify } from './responses';
import type { ValidResponse } from './responses';

const list = (...items: string[]): ValidResponse => ({ kind: 'ItemList', items });

describe('deidentify', () => {
  it('strips participant identity from the pool', () => {
    const pool = deidentify([
      { participantId: 'p-1', value: list('alpha') },
      { participantId: 'p-2', value: list('beta') },
    ]);
    expect(pool).toEqual([{ value: list('alpha') }, { value: list('beta') }]);
    for (const entry of pool) {
      expect(Object.keys(entry)).toEqual(['value']);
    }
  });

  it('orders the pool canonically so import order cannot leak identity', () => {
    const a = { participantId: 'p-1', value: list('alpha') };
    const b = { participantId: 'p-2', value: list('beta') };
    const c = { participantId: 'p-3', value: list('gamma') };
    expect(deidentify([a, b, c])).toEqual(deidentify([c, a, b]));
  });
});
