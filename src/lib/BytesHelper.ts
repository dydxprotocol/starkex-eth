import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import {
  BigNumberable,
} from '../types';

export function stripHexPrefix(input: string) {
  if (input.startsWith('0x')) {
    return input.slice(2);
  }
  return input;
}

export function addressesAreEqual(
  addressOne: string,
  addressTwo: string,
): boolean {
  return !!(addressOne && addressTwo &&
    (stripHexPrefix(addressOne).toLowerCase() === stripHexPrefix(addressTwo).toLowerCase()));
}

const ASSET_ID_MASK = new BigNumber(2).pow(250);

export function getAssetId(
  tokenAddress: string,
  quantization: BigNumberable = 1,
): string {
  const tokenHash: string = soliditySha3('ERC20Token(address)').substr(0, 10);
  const resultBytes = soliditySha3(
    { type: 'bytes4', value: tokenHash },
    { type: 'uint256', value: tokenAddress },
    { type: 'uint256', value: new BigNumber(quantization).toFixed(0) },
  );
  const resultBN = new BigNumber(resultBytes, 16);
  const result = resultBN.mod(ASSET_ID_MASK);
  return `0x${result.toString(16).padStart(64, '0')}`;
}

function soliditySha3(
  ...input: any
): string {
  const result = Web3.utils.soliditySha3(...input);
  if (!result) {
    throw new Error('soliditySha3 produced null output');
  }
  return result;
}
