import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

import { COLLATERAL_ASSET_ID, INTEGERS } from '../lib/Constants';
import {
  humanCollateralAmountToUint256,
  uint256ToHumanCollateralTokenAmount,
} from '../lib/ContractCallHelpers';
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

  public getAddress(): string {
    return this.contracts.collateralToken.options.address;
  }

  public getAssetId(): string {
    return COLLATERAL_ASSET_ID[this.contracts.networkId];
  }

  public async getAllowance(
    {
      ownerAddress,
      spenderAddress,
    }: {
      ownerAddress: Address,
      spenderAddress: Address,
    },
    options?: CallOptions,
  ): Promise<string> {
    const allowance: string = await this.contracts.call(
      this.token.methods.allowance(ownerAddress, spenderAddress),
      options,
    );
    return uint256ToHumanCollateralTokenAmount(allowance);
  }

  public async getBalance(
    {
      ownerAddress,
    }: {
      ownerAddress: Address,
    },
    options?: CallOptions,
  ): Promise<string> {
    const balance: string = await this.contracts.call(
      this.token.methods.balanceOf(ownerAddress),
      options,
    );
    return uint256ToHumanCollateralTokenAmount(balance);
  }

  public async getTotalSupply(
    options?: CallOptions,
  ): Promise<string> {
    const supply: string = await this.contracts.call(
      this.token.methods.totalSupply(),
      options,
    );
    return uint256ToHumanCollateralTokenAmount(supply);
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
  ): Promise<number> {
    const decimals: string = await this.contracts.call(
      this.token.methods.decimals(),
      options,
    );
    return new BigNumber(decimals).toNumber();
  }

  public async getExchangeAllowance(
    {
      ownerAddress,
    }: {
      ownerAddress: Address,
    },
    options?: CallOptions,
  ): Promise<string> {
    return this.getAllowance(
      {
        ownerAddress,
        spenderAddress: this.contracts.starkwarePerpetual.options.address,
      },
      options,
    );
  }

  public async setAllowance(
    {
      spenderAddress,
      humanAmount,
    }: {
      spenderAddress: Address,
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token,
      this.token.methods.approve(
        spenderAddress,
        humanCollateralAmountToUint256(humanAmount),
      ),
      options,
    );
  }

  public async setExchangeAllowance(
    {
      humanAmount,
    }: {
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.setAllowance(
      {
        spenderAddress: this.contracts.starkwarePerpetual.options.address,
        humanAmount,
      },
      options,
    );
  }

  public async setMaximumAllowance(
    {
      spenderAddress,
    }: {
      spenderAddress: Address,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token,
      this.token.methods.approve(
        spenderAddress,
        INTEGERS.ONES_255,
      ),
      options,
    );
  }

  public async setMaximumExchangeAllowance(
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.setMaximumAllowance(
      {
        spenderAddress: this.contracts.starkwarePerpetual.options.address,
      },
      options,
    );
  }

  public async unsetExchangeAllowance(
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.setAllowance(
      {
        spenderAddress: this.contracts.starkwarePerpetual.options.address,
        humanAmount: '0',
      },
      options,
    );
  }

  public async transfer(
    {
      toAddress,
      humanAmount,
    }: {
      toAddress: Address,
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token,
      this.token.methods.transfer(
        toAddress,
        humanCollateralAmountToUint256(humanAmount),
      ),
      options,
    );
  }

  public async transferFrom(
    {
      fromAddress,
      toAddress,
      humanAmount,
    }: {
      fromAddress: Address,
      toAddress: Address,
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.token,
      this.token.methods.transferFrom(
        fromAddress,
        toAddress,
        humanCollateralAmountToUint256(humanAmount),
      ),
      options,
    );
  }

  public async isBlacklisted(
    {
      address,
    }: {
      address: Address,
    },
    options?: CallOptions,
  ): Promise<boolean> {
    const result: boolean = await this.contracts.call(
      this.token.methods.isBlacklisted(address),
      options,
    );
    return result;
  }
}
