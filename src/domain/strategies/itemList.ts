import type { ElicitationSpec } from '../workflow';
import type { ElicitationStrategy, PromptSpec } from './types';
import { err, ok } from '../result';

export function itemListElicitation(
  spec: Extract<ElicitationSpec, { kind: 'ItemList' }>,
): ElicitationStrategy {
  return {
    describe(): PromptSpec {
      return {
        instruction: spec.prompt,
        expects: 'ItemList',
        ...(spec.maxItems !== undefined ? { maxItems: spec.maxItems } : {}),
      };
    },

    validate(raw) {
      if (typeof raw !== 'object' || raw === null) {
        return err('response must be an object with an items field');
      }
      const items = (raw as { items?: unknown }).items;
      if (!Array.isArray(items)) return err('items must be an array');
      const trimmed: string[] = [];
      for (const item of items) {
        if (typeof item !== 'string') return err('each item must be a string');
        const text = item.trim();
        if (text === '') return err('items must not be blank');
        trimmed.push(text);
      }
      if (trimmed.length === 0) return err('at least one item is required');
      if (spec.maxItems !== undefined && trimmed.length > spec.maxItems) {
        return err(`at most ${spec.maxItems} items allowed`);
      }
      return ok({ kind: 'ItemList', items: trimmed });
    },
  };
}
