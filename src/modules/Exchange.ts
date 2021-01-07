import BigNumber from 'bignumber.js';

import { COLLATERAL_ASSET_ID } from '../lib/Constants';
import { Contracts } from '../lib/Contracts';
import { starkKeyToUint256 } from '../lib/StarkKeyHelper';
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

  public async register(
    ethAddress: Address,
    starkKey: string,
    signature: string,
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual.methods.registerUser(
        ethAddress,
        starkKeyToUint256(starkKey),
        signature,
      ),
      options,
    );
  }

  public async deposit(
    starkKey: string,
    positionId: BigNumberable,
    amount: BigNumberable,
    options?: SendOptions,
  ): Promise<TxResult> {
    const depositFunctionSignature = 'deposit(uint256,uint256,uint256,uint256)';
    return this.contracts.send(
      this.contracts.starkwarePerpetual.methods[depositFunctionSignature](
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        new BigNumber(positionId).toFixed(0),
        new BigNumber(amount).toFixed(0),
      ),
      options,
    );
  }

  public async withdraw(
    starkKey: string,
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual.methods.withdraw(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
      ),
      options,
    );
  }

  public async withdrawTo(
    starkKey: string,
    recipient: Address,
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual.methods.withdrawTo(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        recipient,
      ),
      options,
    );
  }

  public async hasCancellationRequest(
    starkKey: string,
    vaultId: BigNumberable,
    options?: CallOptions,
  ): Promise<boolean> {
    const result = await this.contracts.call(
      this.contracts.starkwarePerpetual.methods.getCancellationRequest(
        starkKeyToUint256(starkKey),
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        new BigNumber(vaultId).toFixed(0),
      ),
      options,
    );
    return !new BigNumber(result).isZero();
  }
}
