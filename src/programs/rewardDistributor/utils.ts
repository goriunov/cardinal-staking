import type { AccountData } from "@cardinal/common";
import {
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import { getStakeEntry } from "../stakePool/accounts";
import { findStakeEntryId } from "../stakePool/pda";
import { getRewardEntry } from "./accounts";
import type { RewardDistributorData } from "./constants";
import { RewardDistributorKind } from "./constants";
import { findRewardEntryId } from "./pda";

export const withRemainingAccountsForKind = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  rewardDistributorId: PublicKey,
  kind: RewardDistributorKind,
  rewardMint: PublicKey
): Promise<AccountMeta[]> => {
  switch (kind) {
    case RewardDistributorKind.Mint: {
      return [];
    }
    case RewardDistributorKind.Treasury: {
      const rewardDistributorRewardMintTokenAccountId =
        await withFindOrInitAssociatedTokenAccount(
          transaction,
          connection,
          rewardMint,
          rewardDistributorId,
          wallet.publicKey,
          true
        );
      const userRewardMintTokenAccountId = await findAta(
        rewardMint,
        wallet.publicKey,
        true
      );
      return [
        {
          pubkey: rewardDistributorRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: userRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
      ];
    }
    default:
      return [];
  }
};

/**
 * Get pending rewards of mintIds for a given reward distributor
 * @param connection
 * @param wallet
 * @param mintIds
 * @param rewardDistributor
 * @returns
 */
export const getPendingRewardsForPool = async (
  connection: Connection,
  wallet: PublicKey,
  mintIds: PublicKey[],
  rewardDistributor: AccountData<RewardDistributorData>
): Promise<number> => {
  const UTCNow = Date.now() / 1000;
  let totalRewards = new BN(0);

  const rewardDistributorTokenAccount = await findAta(
    rewardDistributor.parsed.rewardMint,
    rewardDistributor.pubkey,
    true
  );
  const rewardMint = new splToken.Token(
    connection,
    rewardDistributor.parsed.rewardMint,
    splToken.TOKEN_PROGRAM_ID,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    null
  );
  const rewardDistributorTokenAccountInfo = await rewardMint.getAccountInfo(
    rewardDistributorTokenAccount
  );

  for (let i = 0; i < mintIds.length; i++) {
    const mint_id = mintIds[i]!;

    const [stakeEntryId] = await findStakeEntryId(
      connection,
      wallet,
      rewardDistributor.parsed.stakePool,
      mint_id
    );
    const stakeEntry = await tryGetAccount(() =>
      getStakeEntry(connection, stakeEntryId)
    );
    if (
      !stakeEntry ||
      stakeEntry.parsed.pool.toString() !==
        rewardDistributor.parsed.stakePool.toString()
    ) {
      continue;
    }

    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributor.pubkey,
      mint_id
    );
    const rewardEntry = await tryGetAccount(() =>
      getRewardEntry(connection, rewardEntryId)
    );
    let rewardsReceived = new BN(0);
    let multiplier = new BN(1);
    if (rewardEntry) {
      rewardsReceived = rewardEntry.parsed.rewardSecondsReceived;
      multiplier = rewardEntry.parsed.multiplier;
    }
    const rewardTimeToReceive = new BN(
      UTCNow -
        stakeEntry.parsed.lastStakedAt.toNumber() -
        rewardsReceived.toNumber()
    );
    const rewardAmountToReceive = rewardTimeToReceive
      .div(rewardDistributor.parsed.rewardDurationSeconds)
      .mul(rewardDistributor.parsed.rewardAmount)
      .mul(multiplier);
    totalRewards = totalRewards.add(rewardAmountToReceive);
  }

  if (
    rewardDistributor.parsed.maxSupply &&
    rewardDistributor.parsed.rewardsIssued
      .add(totalRewards)
      .gte(rewardDistributor.parsed.maxSupply)
  ) {
    totalRewards = rewardDistributor.parsed.maxSupply.sub(
      rewardDistributor.parsed.rewardsIssued
    );
  }

  if (totalRewards > rewardDistributorTokenAccountInfo.amount) {
    totalRewards = rewardDistributorTokenAccountInfo.amount;
  }

  return totalRewards.toNumber();
};
