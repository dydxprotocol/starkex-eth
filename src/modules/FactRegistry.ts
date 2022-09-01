import Web3 from 'web3';

import { ZERO_ADDRESS } from '../lib/Constants';
import {
  bignumberableToUint256,
  humanCollateralAmountToUint256,
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

  public getAddress(): string {
    return this.contracts.factRegistry.options.address;
  }

  public getTransferEthFact(
    {
      recipient,
      humanAmount,
      salt,
    }: {
      recipient: Address,
      humanAmount: BigNumberable,
      salt: string,
    },
  ): string {
    return this.getTransferErc20Fact({
      tokenAddress: ZERO_ADDRESS,
      tokenDecimals: 18,
      recipient,
      humanAmount,
      salt,
    });
  }

  public getTransferErc20Fact(
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
  ): string {
    const result: string | null = Web3.utils.soliditySha3(
      { type: 'address', value: recipient },
      { type: 'uint256', value: humanTokenAmountToUint256(humanAmount, tokenDecimals) },
      { type: 'address', value: tokenAddress },
      { type: 'uint256', value: bignumberableToUint256(salt) },
    );
    return result as string;
  }

  public async transferEth(
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
      this.contracts.factRegistry,
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
      this.contracts.factRegistry,
      this.contracts.factRegistry.methods.transferERC20(
        recipient,
        tokenAddress,
        humanTokenAmountToUint256(humanAmount, tokenDecimals),
        bignumberableToUint256(salt),
      ),
      options,
    );
  }

  public async transferCollateralToken(
    {
      recipient,
      humanAmount,
      salt,
    }: {
      recipient: Address,
      humanAmount: BigNumberable,
      salt: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.factRegistry,
      this.contracts.factRegistry.methods.transferERC20(
        recipient,
        this.contracts.collateralToken.options.address,
        humanCollateralAmountToUint256(humanAmount),
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
