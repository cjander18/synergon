import type { ElicitationSpec } from '../workflow';
import type { ElicitationStrategy } from './types';
import { err, ok } from '../result';

export function scoreElicitation(
  spec: Extract<ElicitationSpec, { kind: 'Score' }>,
): ElicitationStrategy {
  return {
    describe() {
      return {
        instruction: spec.prompt,
        expects: 'Score',
        items: spec.items,
        scale: spec.scale,
      };
    },

    validate(raw) {
      if (typeof raw !== 'object' || raw === null) {
        return err('response must be an object with a scores field');
      }
      const scores = (raw as { scores?: unknown }).scores;
      if (typeof scores !== 'object' || scores === null || Array.isArray(scores)) {
        return err('scores must map each item to a number');
      }
      const record = scores as Record<string, unknown>;
      const expected = new Set(spec.items);
      for (const key of Object.keys(record)) {
        if (!expected.has(key)) return err(`unexpected item ${JSON.stringify(key)}`);
      }
      const out: Record<string, number> = {};
      for (const item of spec.items) {
        const value = record[item];
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return err(`a numeric score for ${JSON.stringify(item)} is required`);
        }
        if (value < spec.scale.min || value > spec.scale.max) {
          return err(
            `the score for ${JSON.stringify(item)} must be between ${spec.scale.min} and ${spec.scale.max}`,
          );
        }
        out[item] = value;
      }
      return ok({ kind: 'Score', scores: out });
    },
  };
}
