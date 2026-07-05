import type { DeidentifiedResponse, ValidResponse } from '../responses';
import type { AggregationOutput } from '../workflow';
import type { Result } from '../result';

// Sealed into invitation envelopes as JSON; the contributor view renders from
// it. Optional fields are present only where the elicitation kind needs them.
export interface PromptSpec {
  readonly instruction: string;
  readonly expects: ValidResponse['kind'];
  readonly maxItems?: number;
  readonly items?: readonly string[];
  readonly scale?: { readonly min: number; readonly max: number };
}

export interface ElicitationStrategy {
  describe(): PromptSpec;
  validate(raw: unknown): Result<ValidResponse>;
}

export interface AggregationStrategy {
  aggregate(pool: readonly DeidentifiedResponse[]): AggregationOutput;
}
