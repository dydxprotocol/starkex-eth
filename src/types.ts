import BigNumber from 'bignumber.js';
import {
  HttpProvider,
  IpcProvider,
  WebsocketProvider,
  TransactionReceipt,
  Log,
  EventLog,
} from 'web3-core';

export type Provider = HttpProvider | IpcProvider | WebsocketProvider;

export type Address = string;
export type Integer = BigNumber;
export type Decimal = BigNumber;
export type BigNumberable = BigNumber | string | number;

export const Networks = {
  MAINNET: 1,
  ROPSTEN: 3,
  KOVAN: 42,
};

export interface TxResult {
  transactionHash?: string;
  transactionIndex?: number;
  blockHash?: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  contractAddress?: string;
  cumulativeGasUsed?: number;
  gasUsed?: number;
  logs?: Log[];
  events?: {
    [eventName: string]: EventLog;
  };
  nonce?: number; // non-standard field, returned only through dYdX Sender service
  status?: boolean;
  confirmation?: Promise<TransactionReceipt>;
  gasEstimate?: number;
  gas?: number;
}

export interface StarkwareLibOptions {
  ethereumNodeTimeout?: number;
}

export enum ConfirmationType {
  Hash = 0,
  Confirmed = 1,
  Both = 2,
  Simulate = 3,
}

export interface TxOptions {
  from?: Address | null;
  value?: number | string;
}

export interface NativeSendOptions extends TxOptions {
  gasPrice?: number | string;
  gas?: number | string | null;
  nonce?: string | number;
}

export interface SendOptions extends NativeSendOptions {
  confirmations?: number;
  confirmationType?: ConfirmationType;
  gasMultiplier?: number;
}

export interface CallOptions extends TxOptions {
  blockNumber?: number;
}

export const BASE_DECIMALS = 6;

export interface SignedIntStruct {
  value: string;
  isPositive: boolean;
}

/**
 * A value that is represented on the smart contract by an integer shifted by `BASE` decimal places.
 */
export class BaseValue {
  readonly value: BigNumber;

  constructor(value: BigNumberable) {
    this.value = new BigNumber(value);
  }

  public toSolidity(): string {
    return this.value.abs().shiftedBy(BASE_DECIMALS).toFixed(0);
  }

  public toSoliditySignedInt(): SignedIntStruct {
    return {
      value: this.toSolidity(),
      isPositive: this.isPositive(),
    };
  }

  static fromSolidity(solidityValue: BigNumberable, isPositive: boolean = true): BaseValue {
    // Help to detect errors in the parsing and typing of Solidity data.
    if (typeof isPositive !== 'boolean') {
      throw new Error('Error in BaseValue.fromSolidity: isPositive was not a boolean');
    }

    let value = new BigNumber(solidityValue).shiftedBy(-BASE_DECIMALS);
    if (!isPositive) {
      value = value.negated();
    }
    return new BaseValue(value);
  }

  /**
   * Return the BaseValue, rounded down to the nearest Solidity-representable value.
   */
  public roundedDown(): BaseValue {
    return new BaseValue(this.value.decimalPlaces(BASE_DECIMALS, BigNumber.ROUND_DOWN));
  }

  public times(value: BigNumberable): BaseValue {
    return new BaseValue(this.value.times(value));
  }

  public div(value: BigNumberable): BaseValue {
    return new BaseValue(this.value.div(value));
  }

  public plus(value: BigNumberable): BaseValue {
    return new BaseValue(this.value.plus(value));
  }

  public minus(value: BigNumberable): BaseValue {
    return new BaseValue(this.value.minus(value));
  }

  public abs(): BaseValue {
    return new BaseValue(this.value.abs());
  }

  public negated(): BaseValue {
    return new BaseValue(this.value.negated());
  }

  public isPositive(): boolean {
    return this.value.isPositive();
  }

  public isNegative(): boolean {
    return this.value.isNegative();
  }
}
