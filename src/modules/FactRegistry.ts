import {
  bignumberableToUint256,
  humanEthAmountToUint256,
  humanTokenAmountToUint256,
} from '../lib/ContractCallHelpers';
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
    {
      recipient,
      humanAmount,
      salt,
    }: {
      recipient: Address,
      humanAmount: BigNumberable,
      salt: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.factRegistry.methods.transfer(
        recipient,
        bignumberableToUint256(salt),
      ),
      {
        ...options,
        value: humanEthAmountToUint256(humanAmount),
      },
    );
  }

  public async transferERC20(
    {
      recipient,
      tokenAddress,
      tokenDecimals,
      humanAmount,
      salt,
    }: {
      recipient: Address,
      tokenAddress: Address,
      tokenDecimals: number,
      humanAmount: BigNumberable,
      salt: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.factRegistry.methods.transferERC20(
        recipient,
        tokenAddress,
        humanTokenAmountToUint256(humanAmount, tokenDecimals),
        bignumberableToUint256(salt),
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
    {
      fact,
    }: {
      fact: string,
    },
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
