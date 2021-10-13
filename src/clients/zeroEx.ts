import { axiosRequest, generateQueryPath } from '@dydxprotocol/node-service-base';
import Big from 'big.js';

export async function getZeroExSwapQuote({
  sellAmount,
  sellTokenAddress,
  buyTokenAddress,
  slippagePercentage,
  isMainnet,
}: {
  sellAmount: string,
  sellTokenAddress: string,
  buyTokenAddress: string,
  slippagePercentage: string,
  isMainnet: boolean,
}): Promise<{ to: string, data: string, buyAmount: string }> {
  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      isMainnet
        ? 'https://api.0x.org/swap/v1/quote'
        : 'https://ropsten.api.0x.org/swap/v1/quote',
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
