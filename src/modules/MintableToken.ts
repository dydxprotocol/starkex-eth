import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

import { Contracts } from '../lib/Contracts';
import {
  Address,
  BigNumberable,
  SendOptions,
  TxResult,
} from '../types';

export class MintableToken {
  protected contracts: Contracts;
  private token: Contract;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
    this.token = contracts.mintableToken;
  }

  public async setBalance(
    address: Address,
    amount: BigNumberable,
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token.methods.setBalance(
        address,
        new BigNumber(amount).toFixed(0),
      ),
      options,
    );
  }
}
