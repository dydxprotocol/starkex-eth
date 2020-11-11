import Web3 from 'web3';

import { Contracts } from './lib/Contracts';
import { Logs } from './modules/Logs';
import { Networks, Provider, SendOptions } from './types';

export class StarkwareLib {
  public web3: Web3;
  public logs: Logs;
  public contracts: Contracts;

  constructor(
    provider: Provider,
    networkId: number = Networks.ROPSTEN,
    options: SendOptions,
  ) {
    const realProvider: Provider = provider;

    this.web3 = new Web3(realProvider);
    this.contracts = this.getContracts(
      provider,
      networkId,
      this.web3,
      options,
    );
    this.logs = new Logs(this.web3, this.contracts);
  }

  // ============ Helper Functions ============

  protected getContracts(
    provider: Provider,
    networkId: number,
    web3: Web3,
    options: SendOptions,
  ): any {
    return new Contracts(provider, networkId, web3, options);
  }
}
