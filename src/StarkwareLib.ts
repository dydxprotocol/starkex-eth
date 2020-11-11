import Web3 from 'web3';
import { Logs } from './modules/Logs';
import { Networks, Provider, StarkwareLibOptions } from './types';

export class StarkwareLib {
  public web3: Web3;
  public logs: Logs;

  constructor(
    provider: Provider,
    networkId: number = Networks.ROPSTEN,
    // options: StarkwareLibOptions,
  ) {
    const realProvider: Provider = provider;

    this.web3 = new Web3(realProvider);
    this.logs = new Logs(this.web3);
  }

}
