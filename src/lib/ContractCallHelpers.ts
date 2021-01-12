import BigNumber from 'bignumber.js';

import {
  BigNumberable,
  BASE_DECIMALS,
  ETH_DECIMALS,
} from '../types';

// To-Contract Helpers

export function starkKeyToUint256(
  starkKey: string,
): string {
  return new BigNumber(starkKey, 16).toFixed(0);
}

export function bignumberableToUint256(
  amount: BigNumberable,
): string {
  const result = new BigNumber(amount);

  // Solidity only takes integers.
  if (!result.isInteger()) {
    throw new Error(`Amount cannot be used in contract call: ${result.toFixed()}`);
  }

  return result.toFixed(0);
}

export function humanTokenAmountToUint256(
  humanAmount: BigNumberable,
  decimals: number,
): string {
  return bignumberableToUint256(new BigNumber(humanAmount).shiftedBy(decimals));
}

export function humanCollateralAmountToUint256(
  humanAmount: BigNumberable,
): string {
  return humanTokenAmountToUint256(humanAmount, BASE_DECIMALS);
}

export function humanEthAmountToUint256(
  humanAmount: BigNumberable,
): string {
  return humanTokenAmountToUint256(humanAmount, ETH_DECIMALS);
}

// From-Contract Helpers

export function uint256ToHumanEthAmount(
  output: BigNumberable,
): string {
  return uint256ToHumanTokenAmount(output, ETH_DECIMALS);
}

export function uint256ToHumanCollateralTokenAmount(
  output: BigNumberable,
): string {
  return uint256ToHumanTokenAmount(output, BASE_DECIMALS);
}

export function uint256ToHumanTokenAmount(
  output: BigNumberable,
  decimals: number,
): string {
  return new BigNumber(output).shiftedBy(-decimals).toFixed();
}
