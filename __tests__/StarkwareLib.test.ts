import { provider as Provider } from 'web3-core';

import { StarkwareLib } from '../src/index';
import { DummyProvider } from './helpers/DummyProvider';
import { Networks } from '../src/types';

describe('StarwareLib#initiate', () => {
  const dummyProvider = new DummyProvider() as unknown as Provider;

  it('Successfully intiates StarkwareLib on Ropsten', () => {
    const starkwareLib: StarkwareLib = new StarkwareLib(dummyProvider, Networks.ROPSTEN);
    const txResult = {
      logs: [
        {
          address: starkwareLib.contracts.starkwarePerpetual.options.address,
          blockHash: '0x81441018c1131afd6f7ceec2077257f4ecfc3325d56b375bf370008d17a20d65',
          blockNumber: 7492404,
          data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          logIndex: 119,
          removed: false,
          topics: [
            '0x06724742ccc8c330a39a641ef12a0b419bd09248360680bb38159b0a8c2635d6',
            '0x0000000000000000000000006e86dc68723d9811f67d9f6acfec6ec9d3818527',
          ],
          transactionHash: '0xfbb9bc794809a190e7a18278181128d53ed41cec7bf34667e7052edfbff8ad69',
          transactionIndex: 152,
          transactionLogIndex: '0x0',
          type: 'mined',
          id: 'log_21ca9c63',
        }],
    };

    const logs = starkwareLib.logs.parseLogs((txResult as any));
    expect(logs.length === 0);
  });
});
