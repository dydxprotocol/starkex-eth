import { axiosRequest, generateQueryPath } from '@dydxprotocol/node-service-base';

export async function getZeroExSwapQuote({
  sellAmount,
  sellTokenAddress,
  buyTokenAddress,
  slippagePercentage,
  isProduction,
}: {
  sellAmount: string,
  sellTokenAddress: string,
  buyTokenAddress: string,
  slippagePercentage: string,
  isProduction: boolean,
}): Promise<{ to: string, data: string, buyAmount: string }> {
  return axiosRequest({
    method: 'GET',
    url: generateQueryPath(
      isProduction
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
