/*

    Copyright 2019 dYdX Trading Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/
import _ from 'lodash';
import Web3 from 'web3';
import {
  provider as Provider,
  PromiEvent,
  TransactionReceipt,
} from 'web3-core';
import {
  Contract,
  ContractSendMethod,
  EstimateGasOptions,
} from 'web3-eth-contract';

import mintableTokenAbi from '../contracts/mintable-token-abi.json';
import starkwarePerpetualAbi from '../contracts/starkware-perpetual-abi.json';
import usdcAbi from '../contracts/usdc-abi.json';
// Contracts
import {
  TxResult,
  Address,
  ConfirmationType,
  CallOptions,
  SendOptions,
  TxOptions,
  NativeSendOptions,
} from '../types';

enum OUTCOMES {
  INITIAL = 0,
  RESOLVED = 1,
  REJECTED = 2,
}

interface Json {
  abi: any;
  networks: { [network: number]: any };
}

interface ContractInfo {
  contract: Contract;
  json: Json;
  isTest: boolean;
}

export class Contracts {
  private defaultOptions: SendOptions;
  protected web3: Web3;

  public networkId: number;
  public contractsList: ContractInfo[] = [];
  public starkwarePerpetual: Contract;
  public collateralToken: Contract;
  public mintableToken: Contract;

  constructor(
    provider: Provider,
    networkId: number,
    web3: Web3,
    sendOptions: SendOptions = {},
  ) {
    this.web3 = web3;
    this.defaultOptions = {
      gas: null,
      gasPrice: 1000000000,
      value: 0,
      from: null,
      confirmations: 0,
      confirmationType: ConfirmationType.Confirmed,
      gasMultiplier: 1.5,
      ...sendOptions,
    };

    this.networkId = networkId;

    // Contracts
    this.starkwarePerpetual = this.addContract(starkwarePerpetualAbi);
    this.collateralToken = this.addContract(usdcAbi);
    this.mintableToken = this.addContract(mintableTokenAbi);
    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount as string);
  }

  public setProvider(
    provider: Provider,
    networkId: number,
  ): void {
    this.networkId = networkId;

    this.contractsList.forEach(
      (contract) => this.setContractProvider(
        contract.contract,
        contract.json,
        provider,
        networkId,
      ),
    );
  }

  public setDefaultAccount(
    account: Address,
  ): void {
    this.contractsList.forEach(
      (contract) => {
        contract.contract.options.from = account;
      },
    );
  }

  public async call(
    method: ContractSendMethod,
    specificOptions: CallOptions = {},
  ): Promise<any> {
    const {
      blockNumber,
      ...otherOptions
    } = this.toCallOptions({
      ...this.defaultOptions,
      ...specificOptions,
    });
    return (method as any).call(otherOptions, blockNumber || 'latest');
  }

  public async send(
    method: ContractSendMethod,
    specificOptions: SendOptions = {},
  ): Promise<TxResult> {
    const sendOptions: SendOptions = {
      ...this.defaultOptions,
      ...specificOptions,
    };

    const result = await this._send(method, sendOptions);
    return result;
  }

  // ============ Helper Functions ============

  protected addContract(
    json: Json,
    isTest: boolean = false,
  ): Contract {
    const contract = new this.web3.eth.Contract(json.abi);
    this.contractsList.push({ contract, json, isTest });
    return contract;
  }

  private setContractProvider(
    contract: Contract,
    contractJson: Json,
    provider: Provider,
    networkId: number,
  ): void {
    (contract as any).setProvider(provider);

    // Use market-specific info if available, and fall back to non-market-specific info.
    const deployedInfo = contractJson.networks[networkId];
    contract.options.address = deployedInfo && deployedInfo.address;
  }

  private async _send( // tslint:disable-line:function-name
    method: ContractSendMethod,
    sendOptions: SendOptions = {},
  ): Promise<TxResult> {
    const {
      confirmations,
      confirmationType: confirm2,
      gasMultiplier,
      ...txOptions
    } = sendOptions;

    const confirmationType: ConfirmationType = confirm2!;

    if (!Object.values(ConfirmationType).includes(confirmationType!)) {
      throw new Error(`Invalid confirmation type: ${confirmationType}`);
    }

    if (confirmationType === ConfirmationType.Simulate || !txOptions.gas) {
      const gasEstimate = await this.estimateGas(method, txOptions);
      txOptions.gas = Math.floor(gasEstimate * gasMultiplier!);

      if (confirmationType === ConfirmationType.Simulate) {
        return {
          gasEstimate,
          gas: txOptions.gas,
        };
      }
    }

    const promi: PromiEvent<Contract> | any = method.send(
      this.toNativeSendOptions(txOptions) as any,
    );

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    let transactionHash: string | any;
    let hashPromise: Promise<string>;
    let confirmationPromise: Promise<TransactionReceipt> | any;

    if ([
      ConfirmationType.Hash,
      ConfirmationType.Both,
    ].includes(confirmationType)) {
      hashPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error: Error) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.REJECTED;
              reject(error);
              (promi as any).off();
            }
          });

          promi.on('transactionHash', (txHash: string) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.RESOLVED;
              resolve(txHash);
              if (confirmationType !== ConfirmationType.Both) {
                (promi as any).off();
              }
            }
          });
        },
      );
      transactionHash = await hashPromise;
    }

    if ([
      ConfirmationType.Confirmed,
      ConfirmationType.Both,
    ].includes(confirmationType)) {
      confirmationPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error: Error) => {
            if (
              confirmationOutcome === OUTCOMES.INITIAL &&
              (
                confirmationType === ConfirmationType.Confirmed ||
                hashOutcome === OUTCOMES.RESOLVED
              )
            ) {
              confirmationOutcome = OUTCOMES.REJECTED;
              reject(error);
              (promi as any).off();
            }
          });

          if (confirmations) {
            promi.on('confirmation', (confNumber: any, receipt: any) => {
              if (confNumber >= confirmations) {
                if (confirmationOutcome === OUTCOMES.INITIAL) {
                  confirmationOutcome = OUTCOMES.RESOLVED;
                  resolve(receipt);
                  (promi as any).off();
                }
              }
            });
          } else {
            promi.on('receipt', (receipt: any) => {
              confirmationOutcome = OUTCOMES.RESOLVED;
              resolve(receipt);
              (promi as any).off();
            });
          }
        },
      );
    }

    if (confirmationType === ConfirmationType.Hash) {
      return this.normalizeResponse({ transactionHash });
    }

    if (confirmationType === ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    return this.normalizeResponse({
      transactionHash,
      confirmation: confirmationPromise,
    });
  }

  private async estimateGas(
    method: ContractSendMethod,
    txOptions: SendOptions,
  ) {
    const estimateOptions: TxOptions = this.toEstimateOptions(txOptions);
    try {
      const gasEstimate = await method.estimateGas(estimateOptions as EstimateGasOptions);
      return gasEstimate;
    } catch (error) {
      error.transactionData = {
        ...estimateOptions,
        data: method.encodeABI(),
        to: (method as any)._parent._address,
      };
      throw error;
    }
  }

  // ============ Parse Options ============

  private toEstimateOptions(
    options: SendOptions,
  ): TxOptions {
    return _.pick(options, [
      'from',
      'value',
    ]);
  }

  private toCallOptions(
    options: any,
  ): CallOptions {
    return _.pick(options, [
      'from',
      'value',
      'blockNumber',
    ]);
  }

  private toNativeSendOptions(
    options: any,
  ): NativeSendOptions {
    return _.pick(options, [
      'from',
      'value',
      'gasPrice',
      'gas',
      'nonce',
    ]);
  }

  private normalizeResponse(
    txResult: any,
  ): any {
    const txHash = txResult.transactionHash;
    if (txHash) {
      const {
        transactionHash: internalHash,
        nonce: internalNonce,
      } = txHash;
      if (internalHash) {
        txResult.transactionHash = internalHash;
      }
      if (internalNonce) {
        txResult.nonce = internalNonce;
      }
    }
    return txResult;
  }
}
