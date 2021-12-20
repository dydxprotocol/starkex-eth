import BigNumber from 'bignumber.js';

import usdcAbi from '../contracts/usdc-abi.json';
import { Networks } from '../types';
import { getAssetId } from './BytesHelper';

export const INTEGERS = {
  ZERO: new BigNumber(0),
  ONE: new BigNumber(1),
  ONES_255: new BigNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  ), // 2**256-1
};

export const COLLATERAL_ASSET_ID = {
  [Networks.MAINNET]: getAssetId(usdcAbi.networks[1].address),
  [Networks.ROPSTEN]: getAssetId(usdcAbi.networks[3].address),
};

export const ADDRESSES = {
  ZERO: '0x0000000000000000000000000000000000000000',
  DYDX_USDC_ADDRESS_ROPSTEN: '0x8707a5bf4c2842d46b31a405ba41b858c0f876c4',
  USDC_ADDRESS_MAINNET: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  USDC_EXCHANGE_ADDRESS_ROPSTEN: '0x144b40e133495811e1d5fd64ab73ed40186ecb17',
  USDC_EXCHANGE_ADDRESS_MAINNET: '0x032b17633c956c10845643f0bf9ea7c16a3cfb62',
};

export const USDC_ADDRESSES: {[networkId: number]: string } = {
  [Networks.ROPSTEN]: ADDRESSES.DYDX_USDC_ADDRESS_ROPSTEN,
  [Networks.MAINNET]: ADDRESSES.USDC_ADDRESS_MAINNET,
};

export const USDC_EXCHANGE_ADDRESSES: {[networkId: number]: string} = {
  [Networks.ROPSTEN]: ADDRESSES.USDC_EXCHANGE_ADDRESS_ROPSTEN,
  [Networks.MAINNET]: ADDRESSES.USDC_EXCHANGE_ADDRESS_MAINNET,
};
