import Big from 'big.js';
import BigNumber from 'bignumber.js';

import {
  getZeroExERC20SwapQuote,
  getZeroExETHSwapQuote,
  validateSlippage,
} from '../clients/zeroEx';
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
import { getUsdcAddress } from '../lib/heleprs';
import {
  Address,
  BigNumberable,
  CallOptions,
  ETH_DECIMALS,
  BASE_DECIMALS,
  SendOptions,
  TxResult,
  ZeroExSwapResponse,
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

  public getProxyDepositAddress(): string {
    return this.contracts.proxyDepositContract.options.address;
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

  public async registerAndDeposit(
    {
      ethAddress,
      starkKey,
      signature,
      positionId,
      humanAmount,
    }: {
      ethAddress: Address,
      starkKey: string,
      signature: string,
      positionId: BigNumberable,
      humanAmount: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual,
      this.contracts.starkwarePerpetual.methods.registerAndDepositERC20(
        ethAddress,
        starkKeyToUint256(starkKey),
        signature,
        COLLATERAL_ASSET_ID[this.contracts.networkId],
        bignumberableToUint256(positionId),
        humanCollateralAmountToUint256(humanAmount),
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

  public async proxyDeposit(
    {
      humanAmount,
      starkKey,
      positionId,
    }: {
      humanAmount: string,
      starkKey: string,
      positionId: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.deposit(
        humanCollateralAmountToUint256(humanAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
      ),
      options,
    );
  }

  public async approveSwap(
    {
      tokenFrom,
      allowanceTarget,
    }: {
      tokenFrom: string,
      allowanceTarget: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.approveSwap(
        tokenFrom,
        allowanceTarget,
      ),
      options,
    );
  }

  public async proxyDepositERC20(
    {
      humanMinUSDCAmount,
      starkKey,
      positionId,
      zeroExResponseObject,
    }: {
      humanMinUSDCAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      zeroExResponseObject: ZeroExSwapResponse,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.depositERC20(
        zeroExResponseObject.sellTokenAddress,
        zeroExResponseObject.sellAmount,
        humanCollateralAmountToUint256(humanMinUSDCAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.data,
      ),
      options,
    );
  }

  public async approveSwapAndProxyDepositERC20(
    {
      humanMinUSDCAmount,
      starkKey,
      positionId,
      zeroExResponseObject,
    }: {
      humanMinUSDCAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      zeroExResponseObject: ZeroExSwapResponse,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.approveSwapAndDepositERC20(
        zeroExResponseObject.sellTokenAddress,
        zeroExResponseObject.sellAmount,
        humanCollateralAmountToUint256(humanMinUSDCAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.allowanceTarget,
        zeroExResponseObject.data,
      ),
      options,
    );
  }

  public async proxyDepositETH(
    {
      starkKey,
      positionId,
      zeroExResponseObject,
    }: {
      starkKey: string,
      positionId: BigNumberable,
      zeroExResponseObject: ZeroExSwapResponse,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    if (options?.value !== undefined && !Big(options.value).eq(zeroExResponseObject.value)) {
      throw Error(
        `proxyDepositETH: A transaction value ${options.value} was provided which does not match the swap cost of ${zeroExResponseObject.value}`,
      );
    }

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.depositEth(
        zeroExResponseObject.buyAmount,
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.data,
      ),
      { ...options, value: zeroExResponseObject.value },
    );
  }

  public async estimateERC20ToUSDCConversionAmount(
    {
      humanSellAmount,
      sellTokenAddress,
      slippageFraction,
    }: {
      humanSellAmount: string,
      sellTokenAddress: string,
      slippageFraction?: string,
    },
  ): Promise<{
      expectedUSDCHumanAmount: string,
      worstUSDCHumanAmount: string,
      zeroExResponseObject: ZeroExSwapResponse,
    }> {
    validateSlippage(slippageFraction);

    const sellAmount: string = humanCollateralAmountToUint256(humanSellAmount);

    const zeroExResponseObject: ZeroExSwapResponse = await getZeroExERC20SwapQuote(
      {
        sellAmount,
        sellTokenAddress,
        buyTokenAddress: getUsdcAddress(this.contracts.networkId),
        slippageFraction,
        networkId: this.contracts.networkId,
      },
    );

    const expectedUSDCHumanAmount: Big = Big(zeroExResponseObject.buyAmount);
    expectedUSDCHumanAmount.e -= BASE_DECIMALS;

    const worstUSDCHumanAmount: Big = Big(sellAmount).div(zeroExResponseObject.guaranteedPrice);
    worstUSDCHumanAmount.e -= BASE_DECIMALS;

    return {
      expectedUSDCHumanAmount: expectedUSDCHumanAmount.toString(),
      worstUSDCHumanAmount: worstUSDCHumanAmount.toString(),
      zeroExResponseObject,
    };
  }

  public async estimateETHToUSDCConversionAmount(
    {
      humanBuyAmount,
      slippageFraction,
    }: {
      humanBuyAmount: string,
      slippageFraction?: string,
    },
  ): Promise<{
      expectETHHumanAmount: string,
      worstETHHumanAmount: string,
      zeroExResponseObject: ZeroExSwapResponse,
    }> {
    validateSlippage(slippageFraction);

    const buyAmount: string = humanCollateralAmountToUint256(humanBuyAmount);

    const zeroExResponseObject: ZeroExSwapResponse = await getZeroExETHSwapQuote(
      {
        buyAmount,
        buyTokenAddress: getUsdcAddress(this.contracts.networkId),
        slippageFraction,
        networkId: this.contracts.networkId,
      },
    );

    const expectETHHumanAmount: Big = Big(zeroExResponseObject.sellAmount);
    expectETHHumanAmount.e -= ETH_DECIMALS;

    const worstETHHumanAmount: Big = Big(buyAmount).times(zeroExResponseObject.guaranteedPrice);
    worstETHHumanAmount.e -= ETH_DECIMALS;

    return {
      expectETHHumanAmount: expectETHHumanAmount.toString(),
      worstETHHumanAmount: worstETHHumanAmount.toString(),
      zeroExResponseObject,
    };
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

  public async forcedWithdrawalRequest(
    {
      starkKey,
      positionId,
      humanAmount,
      premiumCost,
    }: {
      starkKey: string,
      positionId: BigNumberable,
      humanAmount: BigNumberable,
      premiumCost: boolean,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    return this.contracts.send(
      this.contracts.starkwarePerpetual,
      this.contracts.starkwarePerpetual.methods.forcedWithdrawalRequest(
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        humanCollateralAmountToUint256(humanAmount),
        premiumCost,
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

  public async hasForcedWithdrawalRequest(
    {
      starkKey,
      positionId,
      humanAmount,
    }: {
      starkKey: string,
      positionId: BigNumberable,
      humanAmount: BigNumberable,
    },
    options?: CallOptions,
  ): Promise<boolean> {
    const result = await this.contracts.call(
      this.contracts.starkwarePerpetual.methods.getForcedWithdrawalRequest(
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        humanCollateralAmountToUint256(humanAmount),
      ),
      options,
    );
    return !new BigNumber(result).isZero();
  }
}
