import type { Id } from '../domain/ids';

export interface IdGen {
  next(): Id;
}
