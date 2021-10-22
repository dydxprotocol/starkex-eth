import Big from 'big.js';
import BigNumber from 'bignumber.js';

import { getZeroExERC20SwapQuote, getZeroExETHSwapQuote, validateSlippage } from '../clients/zeroEx';
import {
  COLLATERAL_ASSET_ID,
  USDC_ADDRESSES,
  USDC_DECIMALS,
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

  public async gaslessDeposit(
    {
      depositAmount,
      starkKey,
      positionId,
    }: {
      depositAmount: string,
      starkKey: string,
      positionId: BigNumberable,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    const depositFunctionSignature = 'deposit(uint256,uint256,uint256)';

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods[depositFunctionSignature](
        humanCollateralAmountToUint256(depositAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
      ),
      options,
    );
  }

  public async approveSwap(
    {
      tokenFrom,
      exchange,
    }: {
      tokenFrom: string,
      exchange: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    const approveSwapFunctionSignature = 'approveSwap(address,address)';

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods[approveSwapFunctionSignature](
        tokenFrom,
        exchange,
      ),
      options,
    );
  }

  public async proxyDepositERC20(
    {
      tokenFrom,
      tokenFromAmount,
      minUsdcAmount,
      starkKey,
      positionId,
      slippagePercentage = '1.0',
    }: {
      tokenFrom: string,
      tokenFromAmount: string,
      minUsdcAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      slippagePercentage?: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    validateSlippage(slippagePercentage);

    const sellAmount: string = humanCollateralAmountToUint256(tokenFromAmount);

    const zeroExRequest = await getZeroExERC20SwapQuote(
      {
        sellAmount,
        sellTokenAddress: tokenFrom,
        buyTokenAddress: USDC_ADDRESSES[this.contracts.networkId],
        slippagePercentage,
        networkId: this.contracts.networkId,
      },
    );

    const depositERC20FunctionSignature = 'depositERC20(address,uint256,uint256,uint256,uint256,address,bytes)';

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods[depositERC20FunctionSignature](
        tokenFrom,
        sellAmount,
        humanCollateralAmountToUint256(minUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExRequest.to,
        zeroExRequest.data,
      ),
      options,
    );
  }

  public async approveSwapAndProxyDepositERC20(
    {
      tokenFrom,
      tokenFromAmount,
      minUsdcAmount,
      starkKey,
      positionId,
      slippagePercentage = '1.0',
    }: {
      tokenFrom: string,
      tokenFromAmount: string,
      minUsdcAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      slippagePercentage?: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    validateSlippage(slippagePercentage);

    const sellAmount: string = humanCollateralAmountToUint256(tokenFromAmount);

    const zeroExRequest = await getZeroExERC20SwapQuote(
      {
        sellAmount,
        sellTokenAddress: tokenFrom,
        buyTokenAddress: USDC_ADDRESSES[this.contracts.networkId],
        slippagePercentage,
        networkId: this.contracts.networkId,
      },
    );

    const approveSwapAndDepositERC20FunctionSignature = 'approveSwapAndDepositERC20(address,uint256,uint256,uint256,uint256,address,bytes)';

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods[approveSwapAndDepositERC20FunctionSignature](
        tokenFrom,
        sellAmount,
        minUsdcAmount,
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExRequest.to,
        zeroExRequest.data,
      ),
      options,
    );
  }

  public async proxyDepositETH(
    {
      minUsdcAmount,
      starkKey,
      positionId,
      slippagePercentage = '1.0',
    }: {
      minUsdcAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      slippagePercentage?: string,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    validateSlippage(slippagePercentage);

    const buyAmount: string = humanCollateralAmountToUint256(minUsdcAmount);

    const zeroExRequest = await getZeroExETHSwapQuote(
      {
        buyAmount,
        buyTokenAddress: USDC_ADDRESSES[this.contracts.networkId],
        slippagePercentage,
        networkId: this.contracts.networkId,
      },
    );

    const depositEthFunctionSignature = 'depositEth(uint256,uint256,uint256,address,bytes)';

    if (options?.value && Big(options.value).lt(zeroExRequest.value)) {
      throw Error(
        `Transaction cost: ${zeroExRequest.value} would be greater than specified max amount: ${options.value}`,
      );
    }

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods[depositEthFunctionSignature](
        buyAmount,
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExRequest.to,
        zeroExRequest.data,
      ),
      { ...options, value: zeroExRequest.value },
    );
  }

  public async estimateDepositConversionAmount(
    {
      humanSellAmount,
      sellTokenAddress,
      slippagePercentage = '1.0',
    }: {
      humanSellAmount: string,
      sellTokenAddress: string,
      slippagePercentage?: string,
    },
  ): Promise<string> {
    validateSlippage(slippagePercentage);

    const sellAmount: string = humanCollateralAmountToUint256(humanSellAmount);

    const zeroExRequest = await getZeroExERC20SwapQuote(
      {
        sellAmount,
        sellTokenAddress,
        buyTokenAddress: USDC_ADDRESSES[this.contracts.networkId],
        slippagePercentage,
        networkId: this.contracts.networkId,
      },
    );

    const usdcAmount: Big = Big(zeroExRequest.buyAmount);
    usdcAmount.e -= USDC_DECIMALS;
    return usdcAmount.toString();
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
