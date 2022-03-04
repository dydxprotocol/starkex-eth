import { provider as Provider } from 'web3-core';

import { StarkwareLib } from '../src/index';
import { DummyProvider } from './helpers/DummyProvider';
import { Networks } from '../src/types';
import Web3 from 'web3';

// async ropsten calls can take >10k MS
jest.setTimeout(40000);

describe('StarwareLib#initiate', () => {
  const dummyProvider = new DummyProvider() as unknown as Provider;

  it('Successfully initiates StarkwareLib on Ropsten', async () => {
    const starkwareLib = new StarkwareLib(dummyProvider, Networks.ROPSTEN);
    expect(starkwareLib.collateralToken).toBeTruthy();
    expect(starkwareLib.contracts).toBeTruthy();
    expect(starkwareLib.exchange).toBeTruthy();
    expect(starkwareLib.factRegistry).toBeTruthy();
    expect(starkwareLib.logs).toBeTruthy();
    expect(starkwareLib.mintableToken).toBeTruthy();

    const realProvider = new Web3.providers.HttpProvider(
      process.env.ETHEREUM_NODE_RPC_URL as string,
      { timeout: 10000 },
    );

    const real = new StarkwareLib(realProvider, Networks.ROPSTEN);
    const account = real.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY as string);
    real.web3.eth.accounts.wallet.add(account);
    real.web3.eth.defaultAccount = account.address;

    await real.exchange.setERC20Allowance({
      tokenAddress: '0x8707a5bf4c2842d46b31a405ba41b858c0f876c4',
      address: '0x029bB89d64695D6A461eEbC1Aab4a4C8657a3f22',
      amount: 100,
    }, { from: account.address });

    const result: string = await real.exchange.getERC20Allowance({
      ownerAddress: account.address,
      tokenAddress: '0x8707a5bf4c2842d46b31a405ba41b858c0f876c4',
      spenderAddress: '0x029bB89d64695D6A461eEbC1Aab4a4C8657a3f22',
      decimals: 8,
    });

    expect(result).toEqual('0.000001');
  });
});
