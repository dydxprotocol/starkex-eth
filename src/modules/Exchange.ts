import Big from 'big.js';
import BigNumber from 'bignumber.js';

import {
  getZeroExSwapQuote,
  validateSlippage,
} from '../clients/zeroEx';
import erc20Abi from '../contracts/ierc20-abi.json';
import {
  COLLATERAL_ASSET_ID,
} from '../lib/Constants';
import {
  bignumberableToUint256,
  humanCollateralAmountToUint256,
  humanTokenAmountToUint256,
  starkKeyToUint256,
  uint256ToHumanCollateralTokenAmount,
  uint256ToHumanTokenAmount,
} from '../lib/ContractCallHelpers';
import { Contracts, Json } from '../lib/Contracts';
import { getUsdcAddress } from '../lib/helpers';
import {
  Address,
  BigNumberable,
  CallOptions,
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
      registerUserSignature = Buffer.from('', 'utf8'),
    }: {
      humanAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      registerUserSignature?: Buffer,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    if (options?.sendGaslessTransaction) {
      return this.contracts.proxyDepositContract.methods.deposit(
        humanCollateralAmountToUint256(humanAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        registerUserSignature,
      ).send(options);
    }

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.deposit(
        humanCollateralAmountToUint256(humanAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        registerUserSignature,
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
    if (options?.sendGaslessTransaction) {
      return this.contracts.proxyDepositContract.methods.approveSwap(
        tokenFrom,
        allowanceTarget,
      ).send(options);
    }

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
      humanMinUsdcAmount,
      starkKey,
      positionId,
      zeroExResponseObject,
      registerUserSignature = Buffer.from('', 'utf8'),
    }: {
      humanMinUsdcAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      zeroExResponseObject: ZeroExSwapResponse,
      registerUserSignature?: Buffer,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    if (options?.sendGaslessTransaction) {
      return this.contracts.proxyDepositContract.methods.depositERC20(
        zeroExResponseObject.sellTokenAddress,
        zeroExResponseObject.sellAmount,
        humanCollateralAmountToUint256(humanMinUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.data,
        registerUserSignature,
      ).send(options);
    }

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.depositERC20(
        zeroExResponseObject.sellTokenAddress,
        zeroExResponseObject.sellAmount,
        humanCollateralAmountToUint256(humanMinUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.data,
        registerUserSignature,
      ),
      options,
    );
  }

  public async approveSwapAndProxyDepositERC20(
    {
      humanMinUsdcAmount,
      starkKey,
      positionId,
      zeroExResponseObject,
      registerUserSignature = Buffer.from('', 'utf8'),
    }: {
      humanMinUsdcAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      zeroExResponseObject: ZeroExSwapResponse,
      registerUserSignature?: Buffer,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    if (options?.sendGaslessTransaction) {
      return this.contracts.proxyDepositContract.methods.approveSwapAndDepositERC20(
        zeroExResponseObject.sellTokenAddress,
        zeroExResponseObject.sellAmount,
        humanCollateralAmountToUint256(humanMinUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.allowanceTarget,
        zeroExResponseObject.data,
        registerUserSignature,
      ).send(options);
    }

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.approveSwapAndDepositERC20(
        zeroExResponseObject.sellTokenAddress,
        zeroExResponseObject.sellAmount,
        humanCollateralAmountToUint256(humanMinUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.allowanceTarget,
        zeroExResponseObject.data,
        registerUserSignature,
      ),
      options,
    );
  }

  public async proxyDepositEth(
    {
      humanMinUsdcAmount,
      starkKey,
      positionId,
      zeroExResponseObject,
      registerUserSignature = Buffer.from('', 'utf8'),
    }: {
      humanMinUsdcAmount: string,
      starkKey: string,
      positionId: BigNumberable,
      zeroExResponseObject: ZeroExSwapResponse,
      registerUserSignature?: Buffer,
    },
    options?: SendOptions,
  ): Promise<TxResult> {
    if (options?.value !== undefined && !Big(options.value).eq(zeroExResponseObject.value)) {
      throw Error(
        `proxyDepositEth: A transaction value ${options.value} was provided which does not match the swap cost of ${zeroExResponseObject.value}`,
      );
    }

    if (options?.sendGaslessTransaction) {
      return this.contracts.proxyDepositContract.methods.depositEth(
        humanCollateralAmountToUint256(humanMinUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.data,
        registerUserSignature,
      ).send({ ...options, value: zeroExResponseObject.value });
    }

    return this.contracts.send(
      this.contracts.proxyDepositContract,
      this.contracts.proxyDepositContract.methods.depositEth(
        humanCollateralAmountToUint256(humanMinUsdcAmount),
        starkKeyToUint256(starkKey),
        bignumberableToUint256(positionId),
        zeroExResponseObject.to,
        zeroExResponseObject.data,
        registerUserSignature,
      ),
      { ...options, value: zeroExResponseObject.value },
    );
  }

  /**
   * @description get expected and worst USDC for some amount of input sellToken.
   * @notice For eth pass in 'ETH' as the sellToken.
   */
  public async estimateConversionAmount(
    {
      humanSellAmount,
      sellToken,
      decimals,
      slippageFraction,
    }: {
      humanSellAmount: string,
      sellToken: string,
      decimals: number,
      slippageFraction?: string,
    },
  ): Promise<{
      expectedUsdcHumanAmount: string,
      worstUsdcHumanAmount: string,
      zeroExResponseObject: ZeroExSwapResponse,
    }> {
    validateSlippage(slippageFraction);

    const sellAmount: string = humanTokenAmountToUint256(humanSellAmount, decimals);

    const zeroExResponseObject: ZeroExSwapResponse = await getZeroExSwapQuote(
      {
        sellAmount,
        sellToken,
        buyTokenAddress: getUsdcAddress(this.contracts.networkId),
        slippageFraction,
        networkId: this.contracts.networkId,
      },
    );

    const expectedUsdcHumanAmount: Big = Big(zeroExResponseObject.buyAmount);
    expectedUsdcHumanAmount.e -= BASE_DECIMALS;

    const worstUsdcHumanAmount: Big = Big(sellAmount).div(zeroExResponseObject.guaranteedPrice);
    worstUsdcHumanAmount.e -= BASE_DECIMALS;

    return {
      expectedUsdcHumanAmount: expectedUsdcHumanAmount.round(BASE_DECIMALS, 0).toString(),
      worstUsdcHumanAmount: worstUsdcHumanAmount.round(BASE_DECIMALS, 0).toString(),
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

  public async setERC20Allowance(
    {
      tokenAddress,
      address,
      amount,
    }: {
      tokenAddress: Address,
      address: Address,
      amount: BigNumberable,
    },
    options?: CallOptions,
  ): Promise<TxResult> {
    const token = new this.contracts.web3.eth.Contract((erc20Abi as Json).abi);
    token.options.address = tokenAddress;
    return this.contracts.send(
      token,
      token.methods.approve(
        address,
        amount,
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

  public async getERC20Allowance(
    {
      ownerAddress,
      spenderAddress,
      tokenAddress,
      decimals,
    }: {
      ownerAddress: Address,
      spenderAddress: Address,
      tokenAddress: Address,
      decimals: number,
    },
    options?: CallOptions,
  ): Promise<string> {
    const token = new this.contracts.web3.eth.Contract((erc20Abi as Json).abi);
    token.options.address = tokenAddress;
    const allowance: string = await this.contracts.call(
      token.methods.allowance(
        ownerAddress,
        spenderAddress,
      ),
      options,
    );
    return uint256ToHumanTokenAmount(allowance, decimals);
  }
}
