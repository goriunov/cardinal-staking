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
    receiptMint?: web3.PublicKey;
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

  if (params.stakeType === StakeType.Escrow) {
    const receiptMintId =
      stakeEntryData?.parsed.receiptMint || params.receiptMint;
    if (receiptMintId) {
      await withClaimReceiptMint(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
        receiptMintId,
      });
    } else {
      throw new Error("Reciept mint needs to be initialized");
    }
  }
  return transaction;
};

export const initReceiptMint = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    name: string;
    symbol: string;
  }
): Promise<[web3.Transaction, web3.Keypair]> =>
  withInitReceiptMint(new web3.Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    receiptMintKeypair: web3.Keypair.generate(),
    name: params.name,
    symbol: params.symbol,
  });

export const unstake = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> =>
  withUnstake(new web3.Transaction(), connection, wallet, params);
