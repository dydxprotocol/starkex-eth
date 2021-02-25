import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Log, EventLog } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiInput, AbiItem } from 'web3-utils';

import { Contracts } from '../lib/Contracts';
import {
  TxResult,
  LogValue,
  ParsedLog,
  ParsedLogArgs,
  ParsedLogValue,
} from '../types';

type IContractsByAddress = { [address: string]: Contract[] };

export class Logs {
  private contracts: Contracts;
  private _contractsByAddress?: IContractsByAddress;
  private web3: Web3;

  constructor(
    web3: Web3,
    contracts: Contracts,
  ) {
    this.web3 = web3;
    this.contracts = contracts;
  }

  private get contractsByAddress(): IContractsByAddress {
    if (!this._contractsByAddress) {
      this._contractsByAddress = {};
      for (const { contract, isTest } of this.contracts.contractsList) {
        const contractAddress = contract?.options?.address?.toLowerCase();
        if (!isTest && contractAddress) {
          if (!this._contractsByAddress[contractAddress]) {
            this._contractsByAddress[contractAddress] = [];
          }
          this._contractsByAddress[contractAddress].push(contract);
        }
      }
    }
    return this._contractsByAddress;
  }

  public parseLogs(receipt: TxResult): ParsedLog[] {
    if (receipt.logs) {
      const events: Log[] = JSON.parse(JSON.stringify(receipt.logs));
      return events
        .map((e) => this.parseLog(e))
        .filter(notEmpty);
    }

    if (receipt.events) {
      const tempEvents: Log = JSON.parse(JSON.stringify(receipt.events));
      const events: EventLog[] = [];
      Object.values(tempEvents).forEach((e: EventLog | EventLog[]) => {
        if (Array.isArray(e)) {
          e.forEach((ev: EventLog) => events.push(ev));
        } else {
          events.push(e);
        }
      });
      events.sort((a, b) => a.logIndex - b.logIndex);
      return events.map((e) => this.parseEvent(e)).filter(notEmpty);
    }

    throw new Error('Receipt has no logs');
  }

  private parseEvent(event: EventLog): ParsedLog | null {
    return this.parseLog({
      address: event.address,
      data: event.raw!.data,
      topics: event.raw!.topics,
      logIndex: event.logIndex,
      transactionHash: event.transactionHash,
      transactionIndex: event.transactionIndex,
      blockHash: event.blockHash,
      blockNumber: event.blockNumber,
    });
  }

  private parseLog(log: Log): ParsedLog | null {
    const logAddress = log.address.toLowerCase();
    const contracts: Contract[] | undefined = this.contractsByAddress[logAddress];

    if (!contracts) {
      return null;
    }

    for (let i = 0; i < contracts.length; i += 1) {
      const parsedLog = this.parseLogWithContract(contracts[i], log);
      if (parsedLog) {
        return parsedLog;
      }
    }

    return null;
  }

  private parseLogWithContract(
    contract: Contract,
    log: Log,
  ): ParsedLog | null {
    const events = contract.options.jsonInterface.filter(
      (e: AbiItem) => e.type === 'event',
    );

    const eventJson = events.find(
      (e: any) => e.signature.toLowerCase() === log.topics[0].toLowerCase(),
    );

    if (!eventJson) {
      return null;
    }

    const eventArgs = this.web3.eth.abi.decodeLog(
      eventJson.inputs!,
      log.data,
      log.topics.slice(1),
    );

    return {
      ...log,
      name: eventJson.name,
      args: this.parseArgs(eventJson.inputs!, eventArgs),
    };
  }

  private parseArgs(
    inputs: AbiInput[],
    eventArgs: { [name: string]: LogValue },
  ): ParsedLogArgs {
    const parsedObject: ParsedLogArgs = {};
    for (const input of inputs) {
      const { name } = input;
      parsedObject[name] = this.parseValue(input, eventArgs[name]);
    }
    return parsedObject;
  }

  private parseValue(
    input: AbiInput,
    argValue: LogValue,
  ): ParsedLogValue {
    // TODO: like all other logs except LogDeposit
    if (input.type === 'uint256') {
      // returning everything as strings
      // because listener just needs to store the data
      switch (input.name) {
        case 'starkKey':
        case 'assetType':
        case 'vaultId':
        case 'nonQuantizedAmount':
        case 'quantizedAmount':
        default:
          return argValue;
      }
    }

    if (input.type === 'address') {
      return argValue;
    }
    if (input.type === 'bool') {
      return argValue;
    }
    if (input.type.match(/^bytes[0-9]*$/)) {
      return argValue;
    }
    if (input.type.match(/^uint[0-9]*$/)) {
      return new BigNumber(argValue as string);
    }
    throw new Error(`Unknown event arg type ${input.type}`);
  }
}

function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}
