import Big from 'big.js';

import { axiosRequest } from '../lib/axios/axios';
import { generateQueryPath } from '../lib/axios/request-helpers';
import {
  Networks,
  ZeroExSwapResponse,
} from '../types';

const zeroExUrlMap: { [networkId: number]: string } = {
  [Networks.MAINNET]: 'https://api.0x.org/swap/v1/quote',
  [Networks.ROPSTEN]: 'https://ropsten.api.0x.org/swap/v1/quote',
  [Networks.GOERLI]: 'https://goerli.api.0x.org/swap/v1/quote',
};

const ZERO_EX_API_KEY_HEADER = '0x-api-key';

export async function getZeroExSwapQuote({
  sellAmount,
  sellToken,
  buyTokenAddress,
  slippagePercentage,
  networkId,
  apiKey,
}: {
  sellAmount: string,
  sellToken: string,
  buyTokenAddress: string,
  slippagePercentage?: string,
  networkId: number,
  apiKey: string,
}): Promise<ZeroExSwapResponse> {
  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      zeroExUrlMap[networkId],
      {
        affiliateAddress: '0xB03fc94a3c49B3126A4E6523D10b65d82C44729C',
        sellAmount,
        sellToken,
        buyToken: buyTokenAddress,
        slippagePercentage,
      },
    ),
    headers: {
      ZERO_EX_API_KEY_HEADER: apiKey,
    }
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
