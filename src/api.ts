import {
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection } from "@solana/web3.js";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

import type { RewardDistributorKind } from "./programs/rewardDistributor";
import { withInitRewardDistributor } from "./programs/rewardDistributor/transaction";
import { ReceiptType } from "./programs/stakePool";
import { getStakeEntry, getStakePool } from "./programs/stakePool/accounts";
import {
  withAuthorizeStakeEntry,
  withClaimReceiptMint,
  withInitStakeEntry,
  withInitStakeMint,
  withInitStakePool,
  withStake,
  withUnstake,
} from "./programs/stakePool/transaction";
import { findStakeEntryIdFromMint } from "./programs/stakePool/utils";
import { getMintSupply } from "./utils";

/**
 * Convenience call to create a stake pool
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param requiresCollections - (Optional) List of required collections pubkeys
 * @param requiresCreators - (Optional) List of required creators pubkeys
 * @param requiresAuthorization - (Optional) Boolean to require authorization
 * @param overlayText - (Optional) Text to overlay on receipt mint tokens
 * @param imageUri - (Optional) Image URI for stake pool
 * @returns
 */
export const createStakePool = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    rewardDistributor?: {
      rewardMintId: PublicKey;
      rewardAmount?: BN;
      rewardDurationSeconds?: BN;
      rewardDistributorKind?: RewardDistributorKind;
      maxSupply?: BN;
      supply?: BN;
    };
  }
): Promise<[Transaction, PublicKey, PublicKey?]> => {
  const transaction = new Transaction();

  const [, stakePoolId] = await withInitStakePool(
    transaction,
    connection,
    wallet,
    params
  );
  let rewardDistributorId;
  if (params.rewardDistributor) {
    [, rewardDistributorId] = await withInitRewardDistributor(
      transaction,
      connection,
      wallet,
      {
        stakePoolId: stakePoolId,
        rewardMintId: params.rewardDistributor.rewardMintId,
        rewardAmount: params.rewardDistributor.rewardAmount,
        rewardDurationSeconds: params.rewardDistributor.rewardDurationSeconds,
        kind: params.rewardDistributor.rewardDistributorKind,
        maxSupply: params.rewardDistributor.maxSupply,
        supply: params.rewardDistributor.supply,
      }
    );
  }
  return [transaction, stakePoolId, rewardDistributorId];
};

/**
 * Convenience call to create a reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param rewardMintId - (Optional) Reward mint id
 * @param rewardAmount - (Optional) Reward amount
 * @param rewardDurationSeconds - (Optional) Reward duration in seconds
 * @param rewardDistributorKind - (Optional) Reward distributor kind Mint or Treasury
 * @param maxSupply - (Optional) Max supply
 * @param supply - (Optional) Supply
 * @returns
 */
export const createRewardDistributor = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    supply?: BN;
  }
): Promise<[Transaction, PublicKey]> =>
  withInitRewardDistributor(new Transaction(), connection, wallet, params);

/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
export const createStakeEntry = async (
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

/**
 * Convenience call to authorize a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
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

/**
 * Convenience call to create a stake entry and a stake mint
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export const createStakeEntryAndStakeMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<[Transaction, PublicKey, Keypair | undefined]> => {
  let transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    transaction = (
      await createStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
      })
    )[0];
  }

  let stakeMintKeypair: Keypair | undefined;
  if (!stakeEntryData?.parsed.stakeMint) {
    stakeMintKeypair = Keypair.generate();
    const stakePool = await getStakePool(connection, params.stakePoolId);

    await withInitStakeMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      stakeMintKeypair,
      name: `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
      symbol: `POOl${stakePool.parsed.identifier.toString()}`,
    });
  }

  return [transaction, stakeEntryId, stakeMintKeypair];
};

/**
 * Convenience method to claim rewards
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @returns
 */
export const claimRewards = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    amount?: BN;
  }
): Promise<Transaction> => {
  const transaction = new Transaction();
  await withUnstake(transaction, connection, wallet, params);
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );

  const userOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      wallet.publicKey,
      wallet.publicKey,
      true
    );

  await withStake(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    userOriginalMintTokenAccountId: userOriginalMintTokenAccountId,
    amount: params.amount,
  });

  if (
    stakeEntryData?.parsed.originalMintClaimed ||
    stakeEntryData?.parsed.stakeMintClaimed
  ) {
    const [receiptMintId, receiptType] = stakeEntryData?.parsed
      .originalMintClaimed
      ? [stakeEntryData?.parsed.originalMint, ReceiptType.Original]
      : [stakeEntryData?.parsed.stakeMint, ReceiptType.Receipt];
    if (!receiptMintId) {
      throw new Error(
        "Stake entry has no stake mint. Initialize stake mint first."
      );
    }

    await withClaimReceiptMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      receiptMintId: receiptMintId,
      receiptType: receiptType,
    });
  }

  return transaction;
};

/**
 * Convenience method to stake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @param userOriginalMintTokenAccountId - User's original mint token account id
 * @param receiptType - (Optional) ReceiptType to be received back. If none provided, none will be claimed
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
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
  const supply = await getMintSupply(connection, params.originalMintId);
  if (supply.gt(new BN(1)) && params.receiptType === ReceiptType.Original) {
    throw new Error("Fungible with receipt type Original is not supported yet");
  }

  let transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    [transaction] = await createStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    });
  } else if (
    stakeEntryData.parsed.lastStaker.toString() !==
      PublicKey.default.toString() &&
    supply.gt(new BN(1))
  ) {
    throw new Error(
      "User has fungible tokens already staked in the pool. Staked tokens need to be unstaked and then restaked together with the new tokens."
    );
  }

  await withStake(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
    amount: params.amount,
  });

  if (params.receiptType) {
    const receiptMintId =
      params.receiptType === ReceiptType.Receipt
        ? stakeEntryData?.parsed.stakeMint
        : params.originalMintId;
    if (!receiptMintId) {
      throw new Error(
        "Stake entry has no stake mint. Initialize stake mint first."
      );
    }

    await withClaimReceiptMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      receiptMintId: receiptMintId,
      receiptType: params.receiptType,
    });
  }

  return transaction;
};

/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export const unstake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> =>
  withUnstake(new Transaction(), connection, wallet, params);
