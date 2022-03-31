import { tryGetAccount } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import * as web3 from "@solana/web3.js";

import { ReceiptType } from "./programs/stakePool";
import { getStakeEntry, getStakePool } from "./programs/stakePool/accounts";
import { findStakeEntryId } from "./programs/stakePool/pda";
import {
  withClaimReceiptMint,
  withInitPoolIdentifier,
  withInitStakeEntry,
  withInitStakeMint,
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

export const initStakeEntry = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  return withInitStakeEntry(new web3.Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });
};

export const initStakeEntryAndMint = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    receiptType?: ReceiptType;
  }
): Promise<[web3.Transaction, web3.Keypair | undefined]> => {
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

  let stakeMintKeypair;
  if (params.receiptType === ReceiptType.Receipt) {
    if (!stakeEntryData?.parsed.stakeMint) {
      stakeMintKeypair = web3.Keypair.generate();
      const stakePool = await getStakePool(connection, params.stakePoolId);

      await withInitStakeMint(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
        stakeMintKeypair,
        name: `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
        symbol: `POOl${stakePool.parsed.identifier.toString()}`,
      });
    }
  }

  return [transaction, stakeMintKeypair];
};

export const stake = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    userOriginalMintTokenAccountId: web3.PublicKey;
    receiptType?: ReceiptType;
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

  await withStake(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
  });

  if (params.receiptType) {
    const receiptMintId =
      params.receiptType === ReceiptType.Receipt &&
      stakeEntryData?.parsed.stakeMint
        ? stakeEntryData?.parsed.stakeMint
        : params.originalMintId;
    await withClaimReceiptMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      receiptMintId: receiptMintId,
      receiptType: params.receiptType,
    });
  }

  return transaction;
};

export const claimReceiptMint = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    receiptMintId: web3.PublicKey;
    receiptType: ReceiptType;
  }
): Promise<web3.Transaction> => {
  return await withClaimReceiptMint(
    new web3.Transaction(),
    connection,
    wallet,
    {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
      receiptMintId: params.receiptMintId,
      receiptType: params.receiptType,
    }
  );
};

export const initReceiptMint = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.Keypair]> => {
  const stakePool = await getStakePool(connection, params.stakePoolId);
  return withInitStakeMint(new web3.Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    stakeMintKeypair: web3.Keypair.generate(),
    name: `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
    symbol: `POOl${stakePool.parsed.identifier.toString()}`,
  });
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
