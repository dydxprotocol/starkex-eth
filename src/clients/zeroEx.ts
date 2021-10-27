import Big from 'big.js';

import { axiosRequest } from '../lib/axios/axios';
import { generateQueryPath } from '../lib/axios/request-helpers';
import { Networks, ZeroExSwapResponse } from '../types';

const zeroExUrlMap: { [networkId: number]: string } = {
  [Networks.MAINNET]: 'https://api.0x.org/swap/v1/quote',
  [Networks.ROPSTEN]: 'https://ropsten.api.0x.org/swap/v1/quote',
};

export async function getZeroExSwapQuote({
  sellAmount,
  sellToken,
  buyTokenAddress,
  slippageFraction,
  networkId,
}: {
  sellAmount: string,
  sellToken: string,
  buyTokenAddress: string,
  slippageFraction?: string,
  networkId: number,
}): Promise<ZeroExSwapResponse> {
  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      zeroExUrlMap[networkId],
      {
        sellAmount,
        sellToken,
        buyToken: buyTokenAddress,
        slippageFraction,
      },
    ),
  }) as Promise<ZeroExSwapResponse>;
}

export function validateSlippage(slippage?: string) {
  if (slippage) {
    const slippageBig: Big = Big(slippage);
    if (slippageBig.lt(0) || slippageBig.gt(1)) {
      throw Error(`Slippage: ${slippage} is not a valid fraction from 0 to 1`);
    }
  }
}
