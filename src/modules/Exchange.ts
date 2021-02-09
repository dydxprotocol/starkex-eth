import BigNumber from 'bignumber.js';

import {
  COLLATERAL_ASSET_ID,
} from '../lib/Constants';
import {
  bignumberableToUint256,
  humanCollateralAmountToUint256,
  starkKeyToUint256,
  uint256ToHumanCollateralTokenAmount,
} from '../lib/ContractCallHelpers';
import { Contracts } from '../lib/Contracts';
import {
  Address,
  BigNumberable,
  CallOptions,
  SendOptions,
  TxResult,
} from '../types';

export class Exchange {
  protected contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
  }

  public getAddress(): string {
    return this.contracts.starkwarePerpetual.options.address;
  }

  public async register(
    {
      ethAddress,
      starkKey,
      signature,
    }: {
      ethAddress: Address,
      starkKey: string,
      signature: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual,
      this.contracts.starkwarePerpetual.methods.registerUser(
        ethAddress,
        starkKeyToUint256(starkKey),
        signature,
      ),
      options,
    );
  }

  public async deposit(
    {
      starkKey,
      positionId,
      humanAmount,
    }: {
      starkKey: string,
      positionId: BigNumberable,
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    const depositFunctionSignature = 'deposit(uint256,uint256,uint256,uint256)';
    return this.contracts.send(
      this.contracts.starkwarePerpetual,
      this.contracts.starkwarePerpetual.methods[depositFunctionSignature](
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        bignumberableToUint256(positionId),
        humanCollateralAmountToUint256(humanAmount),
      ),
      options,
    );
  }

  public async withdraw(
    {
      starkKey,
    }: {
      starkKey: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual,
      this.contracts.starkwarePerpetual.methods.withdraw(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
      ),
      options,
    );
  }

  public async withdrawTo(
    {
      starkKey,
      recipient,
    }: {
      starkKey: string,
      recipient: Address,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual,
      this.contracts.starkwarePerpetual.methods.withdrawTo(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        recipient,
      ),
      options,
    );
  }

  // ============ Getters ============

  public async getEthKey(
    {
      starkKey,
    }: {
      starkKey: string,
    },
    options?: CallOptions,
  ): Promise<string | null> {
    try {
      const result = await this.contracts.call(
        this.contracts.starkwarePerpetual.methods.getEthKey(
          starkKeyToUint256(starkKey),
        ),
        options,
      );
      return result;
    } catch (e) {
      if (e.message && e.message.includes('USER_UNREGISTERED')) {
        return null;
      }
      throw e;
    }
  }

  public async getWithdrawalBalance(
    {
      starkKey,
    }: {
      starkKey: string,
    },
    options?: CallOptions,
  ): Promise<string> {
    const result = await this.contracts.call(
      this.contracts.starkwarePerpetual.methods.getWithdrawalBalance(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
      ),
      options,
    );
    return uint256ToHumanCollateralTokenAmount(result);
  }

  public async hasCancellationRequest(
    {
      starkKey,
      vaultId,
    }: {
      starkKey: string,
      vaultId: BigNumberable,
    },
    options?: CallOptions,
  ): Promise<boolean> {
    const result = await this.contracts.call(
      this.contracts.starkwarePerpetual.methods.getCancellationRequest(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        bignumberableToUint256(vaultId),
      ),
      options,
    );
    return !new BigNumber(result).isZero();
  }
}
