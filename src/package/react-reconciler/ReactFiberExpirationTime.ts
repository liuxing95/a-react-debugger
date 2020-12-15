import MAX_SIGNED_31_BIT_INT from '../shared/maxSigned31BitInt';

export type ExpirationTime = number

export const NoWork = 0
export const Never = 1
export const Sync = MAX_SIGNED_31_BIT_INT;

const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1;

// 1 unit of expiration time represents 10ms
export function msToExpiration(ms: number): ExpirationTime {
  // Always add an offset so that we don't clash with the magic number for NoWork.
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0)
}