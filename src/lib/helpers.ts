import {
  PromiEvent,
} from 'web3-core';
import {
  Contract,
} from 'web3-eth-contract';

import { USDC_ADDRESSES } from './Constants';

export enum OUTCOMES {
  INITIAL = 0,
  RESOLVED = 1,
  REJECTED = 2,
}

export function getUsdcAddress(networkId: number): string {
  const buyTokenAddress: string | undefined = USDC_ADDRESSES[networkId];
  if (buyTokenAddress === undefined) {
    throw new Error(`No buyTokenAddress with networkId: ${networkId}`);
  }

  return buyTokenAddress;
}

export async function sendGaslessTransaction(contractCall: PromiEvent<Contract>): Promise<any> {
  let hashOutcome = OUTCOMES.INITIAL;

  const transactionHash = await new Promise(
    (resolve, reject) => {
      contractCall.on('error', (error: Error) => {
        // has not reached a transactionHash or error yet
        if (hashOutcome === OUTCOMES.INITIAL) {
          hashOutcome = OUTCOMES.REJECTED;
          reject(error);
          (contractCall as any).off();
        }
      });

      contractCall.on('transactionHash', (txHash: string) => {
        // has not reached a transactionHash or error yet
        if (hashOutcome === OUTCOMES.INITIAL) {
          hashOutcome = OUTCOMES.RESOLVED;
          resolve(txHash);
          (contractCall as any).off();
        }
      });
    },
  );
  return normalizeResponse({ transactionHash });
}

export function normalizeResponse(
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
