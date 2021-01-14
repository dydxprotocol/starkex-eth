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
};
