import type { AggregationStrategy } from './types';

const byText = (a: { text: string }, b: { text: string }) =>
  a.text < b.text ? -1 : a.text > b.text ? 1 : 0;

// Private scores in, one statistic per item out — evaluation results are only
// ever surfaced in aggregate (docs/concepts.md).
export function scoreAggregation(stat: 'mean' | 'median'): AggregationStrategy {
  return {
    aggregate(pool) {
      const byItem = new Map<string, number[]>();
      for (const response of pool) {
        if (response.value.kind !== 'Score') continue;
        for (const [item, score] of Object.entries(response.value.scores)) {
          const scores = byItem.get(item) ?? [];
          scores.push(score);
          byItem.set(item, scores);
        }
      }
      const items = [...byItem.entries()]
        .map(([text, scores]) => ({ text, score: stat === 'mean' ? mean(scores) : median(scores) }))
        .sort((a, b) => b.score - a.score || byText(a, b));
      return { kind: 'ScoredItems', items };
    },
  };
}

export function rankSumAggregation(): AggregationStrategy {
  return {
    aggregate(pool) {
      const sums = new Map<string, number>();
      for (const response of pool) {
        if (response.value.kind !== 'Rank') continue;
        response.value.ranking.forEach((item, position) => {
          sums.set(item, (sums.get(item) ?? 0) + position + 1);
        });
      }
      const items = [...sums.entries()]
        .map(([text, rankSum]) => ({ text, rankSum }))
        .sort((a, b) => a.rankSum - b.rankSum || byText(a, b));
      return { kind: 'RankedItems', items };
    },
  };
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}
