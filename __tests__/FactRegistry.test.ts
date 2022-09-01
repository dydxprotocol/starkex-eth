import { provider as Provider } from 'web3-core';

import { StarkwareLib } from '../src/index';
import { Networks } from '../src/types';
import { DummyProvider } from './helpers/DummyProvider';

const dummyProvider = new DummyProvider() as unknown as Provider;
let starkwareLib: StarkwareLib;

describe('FactRegistry', () => {

  beforeAll(() => {
    starkwareLib = new StarkwareLib(dummyProvider, Networks.GOERLI);
  });

  describe('getTransferErc20Fact', () => {

    it('succeeds', () => {
      const fact: string = starkwareLib.factRegistry.getTransferErc20Fact({
        tokenAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        recipient: '0x1234567890123456789012345678901234567890',
        tokenDecimals: 3,
        humanAmount: '123.456',
        salt: '0x1234567890abcdef',
      });
      expect(fact).toEqual('0x34052387b5efb6132a42b244cff52a85a507ab319c414564d7a89207d4473672');
    });
  });

  describe('getTransferEthFact', () => {

    it('succeeds', () => {
      const fact: string = starkwareLib.factRegistry.getTransferEthFact({
        recipient: '0x1234567890123456789012345678901234567890',
        humanAmount: '0.000000000000123456',
        salt: '0x1234567890abcdef',
      });
      expect(fact).toEqual('0x76c31e53d0bf2b535249bfb392836cc1238b9a021e87ff0ef93249568aa5a896');
    });
  });
});
