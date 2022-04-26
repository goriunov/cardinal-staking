import {
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import type { web3 } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { getRewardDistributor, getRewardEntry } from "./accounts";
import { RewardDistributorKind } from "./constants";
import {
  claimRewards,
  closeRewardDistributor,
  closeRewardEntry,
  initRewardDistributor,
  initRewardEntry,
  updateRewardEntry,
} from "./instruction";
import { findRewardDistributorId, findRewardEntryId } from "./pda";
import { withRemainingAccountsForKind } from "./utils";

export const withInitRewardDistributor = async (
  transaction: Transaction,
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
): Promise<[Transaction, web3.PublicKey]> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const remainingAccountsForKind = await withRemainingAccountsForKind(
    transaction,
    connection,
    wallet,
    rewardDistributorId,
    params.kind || RewardDistributorKind.Mint,
    params.rewardMintId
  );
  transaction.add(
    initRewardDistributor(connection, wallet, {
      rewardDistributorId,
      stakePoolId: params.stakePoolId,
      rewardMintId: params.rewardMintId,
      rewardAmount: params.rewardAmount || new BN(1),
      rewardDurationSeconds: params.rewardDurationSeconds || new BN(1),
      kind: params.kind || RewardDistributorKind.Mint,
      remainingAccountsForKind,
      maxSupply: params.maxSupply,
      supply: params.supply,
    })
  );
  return [transaction, rewardDistributorId];
};

export const withInitRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    mintId: PublicKey;
    rewardDistributorId: PublicKey;
  }
): Promise<Transaction> => {
  return transaction.add(
    await initRewardEntry(connection, wallet, {
      mint: params.mintId,
      rewardDistributor: params.rewardDistributorId,
    })
  );
};

export const withClaimRewards = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMint: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );

  if (rewardDistributorData) {
    const rewardMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      rewardDistributorData.parsed.rewardMint,
      wallet.publicKey,
      wallet.publicKey
    );

    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );

    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributorData.pubkey,
      params.originalMint
    );
    const rewardEntryData = await tryGetAccount(() =>
      getRewardEntry(connection, rewardEntryId)
    );

    if (!rewardEntryData) {
      transaction.add(
        await initRewardEntry(connection, wallet, {
          mint: params.originalMint,
          rewardDistributor: rewardDistributorData.pubkey,
        })
      );
    }

    transaction.add(
      await claimRewards(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMint,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        rewardMintTokenAccountId: rewardMintTokenAccountId,
        remainingAccountsForKind,
      })
    );
  }
  return transaction;
};

export const withCloseRewardDistributor = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );

  if (rewardDistributorData) {
    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );

    transaction.add(
      await closeRewardDistributor(connection, wallet, {
        stakePoolId: params.stakePoolId,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        remainingAccountsForKind,
      })
    );
  }
  return transaction;
};

export const withUpdateRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    mintId: PublicKey;
    multiplier: BN;
  }
): Promise<Transaction> => {
  return transaction.add(
    await updateRewardEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      mintId: params.mintId,
      multiplier: params.multiplier,
    })
  );
};

export const withCloseRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    mintId: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );

  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.mintId
  );

  return transaction.add(
    closeRewardEntry(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      rewardEntryId: rewardEntryId,
    })
  );
};
