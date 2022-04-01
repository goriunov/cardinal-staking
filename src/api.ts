import { tryGetAccount } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";

import type { RewardDistributorKind } from "./programs/rewardDistributor";
import {
  withInitRewardDistributor,
  withInitRewardEntry,
} from "./programs/rewardDistributor/transaction";
import { ReceiptType } from "./programs/stakePool";
import { getStakeEntry, getStakePool } from "./programs/stakePool/accounts";
import { findStakeEntryId } from "./programs/stakePool/pda";
import {
  withAuthorizeStakeEntry,
  withClaimReceiptMint,
  withInitPoolIdentifier,
  withInitStakeEntry,
  withInitStakeMint,
  withInitStakePool,
  withStake,
  withUnstake,
} from "./programs/stakePool/transaction";

export const initPoolIdentifier = async (
  connection: Connection,
  wallet: Wallet
): Promise<[Transaction, PublicKey]> =>
  withInitPoolIdentifier(new Transaction(), connection, wallet);

export const initStakePool = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    allowedCollections?: PublicKey[];
    allowedCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[Transaction, PublicKey, BN]> =>
  withInitStakePool(new Transaction(), connection, wallet, params);

export const initStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  return withInitStakeEntry(new Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });
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

export const initStakeEntryAndMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    receiptType?: ReceiptType;
  }
): Promise<[Transaction, Keypair | undefined]> => {
  const transaction = new Transaction();
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
      stakeMintKeypair = Keypair.generate();
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
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    receiptType?: ReceiptType;
  }
): Promise<Transaction> => {
  const transaction = new Transaction();
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

export const unstake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> =>
  withUnstake(new Transaction(), connection, wallet, params);

export const initRewardDistributorWithEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    mintId: PublicKey;
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    multiplier?: BN;
  }
): Promise<Transaction> => {
  const [transaction, rewardDistributorId] = await withInitRewardDistributor(
    new Transaction(),
    connection,
    wallet,
    params
  );

  await withInitRewardEntry(transaction, connection, wallet, {
    mintId: params.mintId,
    rewardDistributorId: rewardDistributorId,
    multiplier: params.multiplier,
  });

  return transaction;
};
