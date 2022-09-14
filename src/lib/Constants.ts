import BigNumber from 'bignumber.js';

import usdcAbi from '../contracts/usdc-abi.json';
import usdcExchangeProxyAbi from '../contracts/usdc-exchange-proxy-abi.json';
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
  [Networks.GOERLI]: getAssetId(usdcAbi.networks[5].address),
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const USDC_ADDRESSES: {[networkId: number]: string } = {
  [Networks.MAINNET]: usdcAbi.networks[1].address,
  [Networks.ROPSTEN]: usdcAbi.networks[3].address,
  [Networks.GOERLI]: usdcAbi.networks[5].address,
};

export const USDC_EXCHANGE_ADDRESSES: {[networkId: number]: string} = {
  [Networks.MAINNET]: usdcExchangeProxyAbi.networks[1].address,
  [Networks.ROPSTEN]: usdcExchangeProxyAbi.networks[3].address,
  [Networks.GOERLI]: usdcExchangeProxyAbi.networks[5].address,
};
