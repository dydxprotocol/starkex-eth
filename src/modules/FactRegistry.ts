import BigNumber from 'bignumber.js';

import { Contracts } from '../lib/Contracts';
import {
  Address,
  BigNumberable,
  CallOptions,
  SendOptions,
  TxResult,
} from '../types';

export class FactRegistry {
  protected contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
  }

  public async transferETH(
    recipient: Address,
    amount: BigNumberable,
    salt: string,
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.factRegistry.methods.transfer(
        recipient,
        new BigNumber(salt).toFixed(0),
      ),
      {
        ...options,
        value: new BigNumber(amount).toFixed(0),
      },
    );
  }

  public async transferERC20(
    recipient: Address,
    erc20: Address,
    amount: BigNumberable,
    salt: string,
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.factRegistry.methods.transferERC20(
        recipient,
        erc20,
        new BigNumber(amount).toFixed(0),
        new BigNumber(salt).toFixed(0),
      ),
      options,
    );
  }

  // ============ Getters ============

  public async indentify(
    options?: CallOptions,
  ): Promise<string> {
    const result = await this.contracts.call(
      this.contracts.factRegistry.methods.indentify(),
      options,
    );
    return result;
  }

  public async hasRegisteredFact(
    options?: CallOptions,
  ): Promise<boolean> {
    const result = await this.contracts.call(
      this.contracts.factRegistry.methods.hasRegisteredFact(),
      options,
    );
    return result;
  }

  public async isValid(
    fact: string,
    options?: CallOptions,
  ): Promise<boolean> {
    const result = await this.contracts.call(
      this.contracts.factRegistry.methods.isValid(
        fact,
      ),
      options,
    );
    return result;
  }
}
