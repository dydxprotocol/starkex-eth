import BigNumber from 'bignumber.js';

import { Networks } from '../types';

export const INTEGERS = {
  ZERO: new BigNumber(0),
  ONE: new BigNumber(1),
  ONES_255: new BigNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  ), // 2**256-1
};

export const COLLATERAL_ASSET_ID = {
  [Networks.ROPSTEN]: '0x24d6ea88d53b68601dcf03b3f204cbe829d3689194f823bd6a7f74292c22334',
};
