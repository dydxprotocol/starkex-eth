import Web3 from 'web3';
import {
  provider as Provider,
} from 'web3-core';

import { Contracts } from './lib/Contracts';
import { CollateralToken } from './modules/CollateralToken';
import { Exchange } from './modules/Exchange';
import { FactRegistry } from './modules/FactRegistry';
import { Logs } from './modules/Logs';
import { MintableToken } from './modules/MintableToken';
import { SendOptions } from './types';

export class StarkwareLib {
  public contracts: Contracts;
  public exchange: Exchange;
  public factRegistry: FactRegistry;
  public collateralToken: CollateralToken;
  public mintableToken: MintableToken;
  public logs: Logs;
  public web3: Web3;

  constructor(
    provider: Provider,
    networkId: number,
    options?: SendOptions,
  ) {
    this.web3 = new Web3(provider);
    this.contracts = this.getContracts(
      provider,
      networkId,
      this.web3,
      options,
    );
    this.collateralToken = new CollateralToken(this.contracts);
    this.mintableToken = new MintableToken(this.contracts);
    this.exchange = new Exchange(this.contracts);
    this.factRegistry = new FactRegistry(this.contracts);
    this.logs = new Logs(this.web3, this.contracts);
  }

  public setProvider(
    provider: Provider,
    networkId: number,
  ): void {
    this.web3.setProvider(provider);
    this.contracts.setProvider(provider, networkId);
  }

  // ============ Helper Functions ============

  protected getContracts(
    provider: Provider,
    networkId: number,
    web3: Web3,
    options?: SendOptions,
  ): any {
    return new Contracts(provider, networkId, web3, options);
  }
}
