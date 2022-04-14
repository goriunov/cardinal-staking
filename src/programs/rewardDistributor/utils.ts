import type { AccountData } from "@cardinal/common";
import {
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import type { Wallet } from "@saberhq/solana-contrib";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import type { StakeEntryData } from "../stakePool";
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

export const getPendingRewardsForPool = async (
  connection: Connection,
  stakeEntry: AccountData<StakeEntryData>,
  rewardDistributor: AccountData<RewardDistributorData>,
  mint_id: PublicKey
): Promise<number> => {
  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributor.pubkey,
    mint_id
  );
  const rewardEntry = await getRewardEntry(connection, rewardEntryId);
  const rewardTimeToReceive =
    stakeEntry.parsed.totalStakeSeconds.toNumber() -
    rewardEntry.parsed.rewardSecondsReceived.toNumber();
  const rewardAmountToReceive =
    (rewardTimeToReceive /
      rewardDistributor.parsed.rewardDurationSeconds.toNumber()) *
    rewardDistributor.parsed.rewardAmount.toNumber() *
    rewardEntry.parsed.multiplier.toNumber();
  return rewardAmountToReceive;
};
