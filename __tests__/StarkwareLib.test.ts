import Web3 from 'web3';
import { provider as Provider } from 'web3-core';

import usdcAbi from '../src/contracts/usdc-abi.json';
import { StarkwareLib } from '../src/index';
import { Networks } from '../src/types';
import { DummyProvider } from './helpers/DummyProvider';

describe('StarwareLib#initiate', () => {
  const dummyProvider = new DummyProvider() as unknown as Provider;

  it('Successfully initiates StarkwareLib on Goerli', async () => {
    const starkwareLib = new StarkwareLib(dummyProvider, Networks.GOERLI);
    expect(starkwareLib.collateralToken).toBeTruthy();
    expect(starkwareLib.contracts).toBeTruthy();
    expect(starkwareLib.exchange).toBeTruthy();
    expect(starkwareLib.factRegistry).toBeTruthy();
    expect(starkwareLib.logs).toBeTruthy();
    expect(starkwareLib.mintableToken).toBeTruthy();

    try {
      const realProvider = new Web3.providers.HttpProvider(
        process.env.ETHEREUM_NODE_RPC_URL as string,
        { timeout: 10000 },
      );

      const real = new StarkwareLib(realProvider, Networks.GOERLI);
      const account = real.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY as string);
      real.web3.eth.accounts.wallet.add(account);
      real.web3.eth.defaultAccount = account.address;

      await real.exchange.setERC20Allowance({
        tokenAddress: usdcAbi.networks[5].address,
        address: '0x029bB89d64695D6A461eEbC1Aab4a4C8657a3f22',
        amount: 100,
      }, { from: account.address });

      const result: string = await real.exchange.getERC20Allowance({
        ownerAddress: account.address,
        tokenAddress: usdcAbi.networks[5].address,
        spenderAddress: '0x029bB89d64695D6A461eEbC1Aab4a4C8657a3f22',
        decimals: 8,
      });

      expect(result).toEqual('0.000001');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });
});
