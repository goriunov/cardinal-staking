import { tryGetAccount } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import * as web3 from "@solana/web3.js";

import { StakeType } from "./programs/stakePool";
import { getStakeEntry } from "./programs/stakePool/accounts";
import { findStakeEntryId } from "./programs/stakePool/pda";
import {
  withClaimReceiptMint,
  withInitPoolIdentifier,
  withInitReceiptMint,
  withInitStakeEntry,
  withInitStakePool,
  withStake,
  withUnstake,
} from "./programs/stakePool/transaction";

export const initPoolIdentifier = async (
  connection: web3.Connection,
  wallet: Wallet
): Promise<[web3.Transaction, web3.PublicKey]> =>
  withInitPoolIdentifier(new web3.Transaction(), connection, wallet);

export const initStakePool = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    allowedCollections?: web3.PublicKey[];
    allowedCreators?: web3.PublicKey[];
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[web3.Transaction, web3.PublicKey, BN]> =>
  withInitStakePool(new web3.Transaction(), connection, wallet, params);

export const stake = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakeType?: StakeType;
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    userOriginalMintTokenAccountId: web3.PublicKey;
    receipt?: {
      name?: string;
      symbol?: string;
    };
  }
): Promise<web3.Transaction> => {
  const transaction = new web3.Transaction();
  const [stakeEntryId] = await findStakeEntryId(
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    await withInitStakeEntry(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    });
  }

  await withStake(transaction, connection, wallet, params);

  let receiptMintKeypair;
  if (stakeEntryData && params.stakeType === StakeType.Escrow) {
    if (!stakeEntryData.parsed.receiptMint) {
      receiptMintKeypair = web3.Keypair.generate();
      await withInitReceiptMint(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
        receiptMintKeypair,
        name: params.receipt?.name || "RECEIPT",
        symbol: params.receipt?.symbol || "RCP",
      });
    }
    const receiptMintId =
      stakeEntryData?.parsed.receiptMint || receiptMintKeypair?.publicKey;
    if (receiptMintId) {
      await withClaimReceiptMint(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
        receiptMintId,
      });
    }
  }
  return transaction;
};

export const unstake = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> =>
  withUnstake(new web3.Transaction(), connection, wallet, params);
