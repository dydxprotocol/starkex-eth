import BigNumber from 'bignumber.js';
import {
  EventLog,
  Log,
  TransactionReceipt,
} from 'web3-core';

export type Address = string;
export type Integer = BigNumber;
export type Decimal = BigNumber;
export type BigNumberable = BigNumber | string | number;
export type LogValue = string | number | boolean;
export type ParsedLogValue = BigNumber | string | number | boolean;

export const Networks = {
  MAINNET: 1,
  ROPSTEN: 3,
  GOERLI: 5,
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
  Hash = 'Hash',
  Confirmed = 'Confirmed',
  Both = 'Both',
  Simulate = 'Simulate',
  Sender = 'Sender',
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
  sendGaslessTransaction?: boolean;
  signatureType?: string;
}

export interface CallOptions extends TxOptions {
  blockNumber?: number;
}

export const BASE_DECIMALS = 6;

export const ETH_DECIMALS = 18;

export interface SignedIntStruct {
  value: string;
  isPositive: boolean;
}

export interface ParsedLogArgs {
  [name: string]: ParsedLogValue;
}

export interface ParsedLog extends Log {
  name?: string;
  args: ParsedLogArgs;
}

export interface ZeroExSwapResponse {
  guaranteedPrice: string,
  to: string,
  data: Buffer,
  value: string,
  buyAmount: string,
  sellAmount: string,
  buyTokenAddress: string,
  sellTokenAddress: string,
  allowanceTarget: string,
}
