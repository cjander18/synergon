import type { DeidentifiedResponse, ValidResponse } from '../responses';
import type { AggregationOutput } from '../workflow';
import type { Result } from '../result';

export interface PromptSpec {
  readonly instruction: string;
  readonly expects: ValidResponse['kind'];
  readonly maxItems?: number;
}

export interface ElicitationStrategy {
  describe(): PromptSpec;
  validate(raw: unknown): Result<ValidResponse>;
}

export interface AggregationStrategy {
  aggregate(pool: readonly DeidentifiedResponse[]): AggregationOutput;
}
