import type { ElicitationSpec } from '../workflow';
import type { ElicitationStrategy } from './types';
import { err, ok } from '../result';

export function rankElicitation(
  spec: Extract<ElicitationSpec, { kind: 'Rank' }>,
): ElicitationStrategy {
  return {
    describe() {
      return { instruction: spec.prompt, expects: 'Rank', items: spec.items };
    },

    validate(raw) {
      if (typeof raw !== 'object' || raw === null) {
        return err('response must be an object with a ranking field');
      }
      const ranking = (raw as { ranking?: unknown }).ranking;
      if (!Array.isArray(ranking) || ranking.some((item) => typeof item !== 'string')) {
        return err('ranking must be an array of item texts');
      }
      const expected = new Set(spec.items);
      const seen = new Set(ranking as string[]);
      const isPermutation =
        ranking.length === spec.items.length &&
        seen.size === ranking.length &&
        [...seen].every((item) => expected.has(item));
      if (!isPermutation) {
        return err('the ranking must include every item exactly once');
      }
      return ok({ kind: 'Rank', ranking: ranking as string[] });
    },
  };
}
