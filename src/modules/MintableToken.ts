import { Contract } from 'web3-eth-contract';

import {
  humanCollateralAmountToUint256,
} from '../lib/ContractCallHelpers';
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
    {
      address,
      humanAmount,
    }: {
      address: Address,
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token,
      this.token.methods.setBalance(
        address,
        humanCollateralAmountToUint256(humanAmount),
      ),
      options,
    );
  }
}
