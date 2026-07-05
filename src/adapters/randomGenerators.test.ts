import { describe, it, expect } from 'vitest';
import { CryptoRandomIdGen, CryptoRandomPasswordGen } from './randomGenerators';

describe('CryptoRandomIdGen', () => {
  it('produces unique UUID-shaped ids', () => {
    const gen = new CryptoRandomIdGen();
    const ids = Array.from({ length: 50 }, () => gen.next());
    expect(new Set(ids).size).toBe(50);
    for (const id of ids) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    }
  });
});

describe('CryptoRandomPasswordGen', () => {
  it('produces unique, human-conveyable passwords without ambiguous characters', () => {
    const gen = new CryptoRandomPasswordGen();
    const passwords = Array.from({ length: 50 }, () => gen.next());
    expect(new Set(passwords).size).toBe(50);
    for (const password of passwords) {
      expect(password).toMatch(/^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}$/);
      expect(password).not.toMatch(/[ilou]/);
    }
  });
});
