import { provider as Provider } from 'web3-core';

import { StarkwareLib } from '../src/index';
import { DummyProvider } from './helpers/DummyProvider';
import { Networks } from '../src/types';

describe('StarwareLib#initiate', () => {
  const dummyProvider = new DummyProvider() as unknown as Provider;

  it('Successfully intiates StarkwareLib on Ropsten', () => {
    const starkwareLib = new StarkwareLib(dummyProvider, Networks.ROPSTEN);
    expect(starkwareLib.collateralToken).toBeTruthy();
    expect(starkwareLib.contracts).toBeTruthy();
    expect(starkwareLib.exchange).toBeTruthy();
    expect(starkwareLib.factRegistry).toBeTruthy();
    expect(starkwareLib.logs).toBeTruthy();
    expect(starkwareLib.mintableToken).toBeTruthy();
  });
});
