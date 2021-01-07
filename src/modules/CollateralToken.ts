import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

import { COLLATERAL_ASSET_ID, INTEGERS } from '../lib/Constants';
import { Contracts } from '../lib/Contracts';
import {
  BigNumberable,
  CallOptions,
  SendOptions,
  TxResult,
  Address,
} from '../types';

export class CollateralToken {
  protected contracts: Contracts;
  private token: Contract;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
    this.token = contracts.collateralToken;
  }

  public getAssetId(): string {
    return COLLATERAL_ASSET_ID[this.contracts.networkId];
  }

  public async getAllowance(
    ownerAddress: Address,
    spenderAddress: Address,
    options?: CallOptions,
  ): Promise<BigNumber> {
    const allowance: string = await this.contracts.call(
      this.token.methods.allowance(ownerAddress, spenderAddress),
      options,
    );
    return new BigNumber(allowance);
  }

  public async getBalance(
    ownerAddress: Address,
    options?: CallOptions,
  ): Promise<BigNumber> {
    const balance: string = await this.contracts.call(
      this.token.methods.balanceOf(ownerAddress),
      options,
    );
    return new BigNumber(balance);
  }

  public async getTotalSupply(
    options?: CallOptions,
  ): Promise<BigNumber> {
    const supply: string = await this.contracts.call(
      this.token.methods.totalSupply(),
      options,
    );
    return new BigNumber(supply);
  }

  public async getName(
    options?: CallOptions,
  ): Promise<string> {
    return this.contracts.call(
      this.token.methods.name(),
      options,
    );
  }

  public async getSymbol(
    options?: CallOptions,
  ): Promise<string> {
    return this.contracts.call(
      this.token.methods.symbol(),
      options,
    );
  }

  public async getDecimals(
    options?: CallOptions,
  ): Promise<BigNumber> {
    const decimals: string = await this.contracts.call(
      this.token.methods.decimals(),
      options,
    );
    return new BigNumber(decimals);
  }

  public async getExchangeAllowance(
    ownerAddress: Address,
    options?: CallOptions,
  ): Promise<BigNumber> {
    return this.getAllowance(
      ownerAddress,
      this.contracts.starkwarePerpetual.options.address,
      options,
    );
  }

  public async setAllowance(
    ownerAddress: Address,
    spenderAddress: Address,
    amount: BigNumberable,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token.methods.approve(
        spenderAddress,
        new BigNumber(amount).toFixed(0),
      ),
      { ...options, from: ownerAddress },
    );
  }

  public async setExchangeAllowance(
    ownerAddress: Address,
    amount: BigNumberable,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.setAllowance(
      ownerAddress,
      this.contracts.starkwarePerpetual.options.address,
      amount,
      options,
    );
  }

  public async setMaximumAllowance(
    ownerAddress: Address,
    spenderAddress: Address,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.setAllowance(
      ownerAddress,
      spenderAddress,
      INTEGERS.ONES_255,
      options,
    );
  }

  public async setMaximumExchangeAllowance(
    ownerAddress: Address,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.setAllowance(
      ownerAddress,
      this.contracts.starkwarePerpetual.options.address,
      INTEGERS.ONES_255,
      options,
    );
  }

  public async unsetExchangeAllowance(
    ownerAddress: Address,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.setAllowance(
      ownerAddress,
      this.contracts.starkwarePerpetual.options.address,
      INTEGERS.ZERO,
      options,
    );
  }

  public async transfer(
    fromAddress: Address,
    toAddress: Address,
    amount: BigNumberable,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token.methods.transfer(
        toAddress,
        new BigNumber(amount).toFixed(0),
      ),
      { ...options, from: fromAddress },
    );
  }

  public async transferFrom(
    fromAddress: Address,
    toAddress: Address,
    senderAddress: Address,
    amount: BigNumberable,
    options: SendOptions = {},
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token.methods.transferFrom(
        fromAddress,
        toAddress,
        new BigNumber(amount).toFixed(0),
      ),
      { ...options, from: senderAddress },
    );
  }
}
