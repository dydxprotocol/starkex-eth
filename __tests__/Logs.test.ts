import { provider as Provider } from 'web3-core';

import { StarkwareLib } from '../src/index';
import { DummyProvider } from './helpers/DummyProvider';
import { Networks } from '../src/types';

const dummyProvider = new DummyProvider() as unknown as Provider;
let starkwareLib: StarkwareLib;

const blockHash = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const blockNumber = 123456;
const transactionHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
const transactionIndex = 123;
const defaultLog = {
  transactionHash,
  transactionIndex,
  blockHash,
  blockNumber,
};

describe('Logs', () => {

  beforeAll(() => {
    starkwareLib = new StarkwareLib(dummyProvider, Networks.ROPSTEN);
  });

  it('Successfully parses transfer logs', () => {
    const transferLog = {
      ...defaultLog,
      logIndex: 1,
      address: starkwareLib.contracts.collateralToken.options.address,
      data: '0x000000000000000000000000000000000000000000000000000000e8d4a51000',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000057d8493313acbfb4f788e8d74e36ea90118435aa',
        '0x00000000000000000000000080243abb88801c93d91814fbd621a68bbaa769f4',
      ],
    };
    const logs = starkwareLib.logs.parseLogs({
      logs: [transferLog],
    });

    expect(logs).toEqual([
      {
        ...transferLog,
        name: 'Transfer',
        args: {
          from: '0x57D8493313acBFb4F788e8D74e36EA90118435aA',
          to: '0x80243ABB88801c93d91814FbD621A68bbaA769F4',
          value: '1000000000000',
        },
      },
    ]);
  });

  it('Ignores non-related logs', () => {
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

    const logs = starkwareLib.logs.parseLogs(txResult);
    expect(logs.length).toEqual(0);
    expect(logs).toEqual([]);
  });
});
