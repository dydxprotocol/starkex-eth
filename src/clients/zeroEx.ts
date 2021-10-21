import Big from 'big.js';

import { axiosRequest } from '../lib/axios/axios';
import { generateQueryPath } from '../lib/axios/request-helpers';
import { Networks } from '../types';

const zeroExUrlMap: { [networkId: number]: string } = {
  [Networks.MAINNET]: 'https://api.0x.org/swap/v1/quote',
  [Networks.ROPSTEN]: 'https://ropsten.api.0x.org/swap/v1/quote',
};

export async function getZeroExSwapQuote({
  sellAmount,
  sellTokenAddress,
  buyTokenAddress,
  slippagePercentage,
  networkId,
}: {
  sellAmount: string,
  sellTokenAddress: string,
  buyTokenAddress: string | undefined,
  slippagePercentage: string,
  networkId: number,
}): Promise<{ to: string, data: string, buyAmount: string }> {
  if (buyTokenAddress === undefined) {
    throw new Error(`No buyTokenAddress with networkId: ${networkId}`);
  }

  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      zeroExUrlMap[networkId],
      {
        sellAmount,
        sellToken: sellTokenAddress,
        buyToken: buyTokenAddress,
        slippagePercentage,
      },
    ),
  }) as Promise<{ to: string, data: string, buyAmount: string }>;
}

export function validateSlippage(slippage: string) {
  const slippageBig: Big = Big(slippage);
  if (slippageBig.lt(0) || slippageBig.gt(100)) {
    throw Error(`Slippage: ${slippage} is not a valid percent from 0 to 100`);
  }
}
