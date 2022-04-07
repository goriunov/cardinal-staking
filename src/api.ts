import { tryGetAccount } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";

import { ReceiptType } from "./programs/stakePool";
import { getStakeEntry, getStakePool } from "./programs/stakePool/accounts";
import { findStakeEntryId } from "./programs/stakePool/pda";
import {
  withAuthorizeStakeEntry,
  withClaimReceiptMint,
  withInitFungibleStakeEntry,
  withInitPoolIdentifier,
  withInitStakeEntry,
  withInitStakeMint,
  withInitStakePool,
  withStake,
  withUnstake,
} from "./programs/stakePool/transaction";
import { getMintSupply } from "./utils";

export const initPoolIdentifier = async (
  connection: Connection,
  wallet: Wallet
): Promise<[Transaction, PublicKey]> =>
  withInitPoolIdentifier(new Transaction(), connection, wallet);

export const initStakePool = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[Transaction, PublicKey]> =>
  withInitStakePool(new Transaction(), connection, wallet, params);

export const initStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    user?: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  const supply = await getMintSupply(connection, params.originalMintId);
  if (supply > 1) {
    return withInitFungibleStakeEntry(new Transaction(), connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
      user: params.user || wallet.publicKey,
    });
  } else {
    return withInitStakeEntry(new Transaction(), connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    });
  }
};

export const authorizeStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> => {
  return withAuthorizeStakeEntry(new Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });
};

export const initStakeEntryAndStakeMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    amount?: number;
  }
): Promise<[Transaction, Keypair, PublicKey]> => {
  const [stakeEntryId] = await findStakeEntryId(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (stakeEntryData) {
    throw new Error("Stake entry already exists");
  }
  const [transaction] = await initStakeEntry(connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });

  const stakeMintKeypair = Keypair.generate();
  const stakePool = await getStakePool(connection, params.stakePoolId);

  await withInitStakeMint(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    stakeEntryId: stakeEntryId,
    originalMintId: params.originalMintId,
    stakeMintKeypair,
    name: `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
    symbol: `POOl${stakePool.parsed.identifier.toString()}`,
    amount: params.amount,
  });

  return [transaction, stakeMintKeypair, stakeEntryId];
};

export const stake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    receiptType?: ReceiptType;
    amount?: BN;
  }
): Promise<Transaction> => {
  const transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryId(
    connection,
    wallet.publicKey,
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
    amount: params.amount,
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

export const unstake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> =>
  withUnstake(new Transaction(), connection, wallet, params);
