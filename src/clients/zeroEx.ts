import Big from 'big.js';

import { axiosRequest } from '../lib/axios/axios';
import { generateQueryPath } from '../lib/axios/request-helpers';
import { Networks } from '../types';

const zeroExUrlMap: { [networkId: number]: string } = {
  [Networks.MAINNET]: 'https://api.0x.org/swap/v1/quote',
  [Networks.ROPSTEN]: 'https://ropsten.api.0x.org/swap/v1/quote',
};

export async function getZeroExERC20SwapQuote({
  sellAmount,
  sellTokenAddress,
  buyTokenAddress,
  slippageFraction,
  networkId,
}: {
  sellAmount: string,
  sellTokenAddress: string,
  buyTokenAddress: string,
  slippageFraction?: string,
  networkId: number,
}): Promise<{ to: string, data: string, buyAmount: string, allowanceTarget: string }> {
  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      zeroExUrlMap[networkId],
      {
        sellAmount,
        sellToken: sellTokenAddress,
        buyToken: buyTokenAddress,
        slippageFraction,
      },
    ),
  }) as Promise<{ to: string, data: string, buyAmount: string, allowanceTarget: string }>;
}

export async function getZeroExETHSwapQuote({
  buyAmount,
  buyTokenAddress,
  slippageFraction,
  networkId,
}: {
  buyAmount: string,
  buyTokenAddress: string,
  slippageFraction?: string,
  networkId: number,
}): Promise<{ to: string, data: string, value: number }> {
  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      zeroExUrlMap[networkId],
      {
        buyAmount,
        sellToken: 'ETH',
        buyToken: buyTokenAddress,
        slippageFraction,
      },
    ),
  }) as Promise<{ to: string, data: string, value: number }>;
}

export function validateSlippage(slippage?: string) {
  if (slippage) {
    const slippageBig: Big = Big(slippage);
    if (slippageBig.lt(0) || slippageBig.gt(1)) {
      throw Error(`Slippage: ${slippage} is not a valid fraction from 0 to 1`);
    }
  }
}
