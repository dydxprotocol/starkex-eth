import BigNumber from 'bignumber.js';

export function starkKeyToUint256(
  starkKey: string,
): string {
  return new BigNumber(starkKey, 16).toFixed(0);
}
