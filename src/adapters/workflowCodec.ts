import type { Result } from '../domain/result';
import type { Workflow } from '../domain/workflow';
import { err, ok } from '../domain/result';
import { fromBase64Url, toBase64Url } from './base64url';

// Export/import format for workflow backup and device moves: versioned JSON
// with binary fields (envelope salt/iv/ciphertext) as tagged base64url.
// Contains only what the repository stores — ciphertext, never passwords.
const BINARY_TAG = '__u8';

export function encodeWorkflow(workflow: Workflow): string {
  return JSON.stringify(
    { v: 1, workflow },
    (_key, value: unknown) =>
      value instanceof Uint8Array ? { [BINARY_TAG]: toBase64Url(value) } : value,
    2,
  );
}

export function decodeWorkflow(text: string): Result<Workflow> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text, (_key, value: unknown) => {
      if (typeof value === 'object' && value !== null && BINARY_TAG in value) {
        const encoded = (value as Record<string, unknown>)[BINARY_TAG];
        if (typeof encoded !== 'string') throw new Error('bad binary field');
        const bytes = fromBase64Url(encoded);
        if (!bytes.ok) throw new Error(bytes.error);
        return bytes.value;
      }
      return value;
    });
  } catch {
    return err('this is not an exported workflow file');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return err('this is not an exported workflow file');
  }
  const envelope = parsed as { v?: unknown; workflow?: unknown };
  if (envelope.v !== 1) return err(`unsupported export version ${String(envelope.v)}`);
  const workflow = envelope.workflow as Partial<Workflow> | undefined;
  if (
    workflow === undefined ||
    typeof workflow.id !== 'string' ||
    typeof workflow.title !== 'string' ||
    !Array.isArray(workflow.participants) ||
    !Array.isArray(workflow.rounds) ||
    (workflow.status !== 'Active' && workflow.status !== 'Closed')
  ) {
    return err('this is not an exported workflow file');
  }
  return ok(workflow as Workflow);
}
