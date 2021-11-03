import { USDC_ADDRESSES } from './Constants';

export function getUsdcAddress(networkId: number): string {
  const buyTokenAddress: string | undefined = USDC_ADDRESSES[networkId];
  if (buyTokenAddress === undefined) {
    throw new Error(`No buyTokenAddress with networkId: ${networkId}`);
  }

  return buyTokenAddress;
}
