import type { AccountData } from "@cardinal/common";
import { findAta } from "@cardinal/common";
import type { web3 } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import type {
  ConfirmOptions,
  Connection,
  PublicKey,
  Signer,
  Transaction,
} from "@solana/web3.js";
import { Keypair, sendAndConfirmRawTransaction } from "@solana/web3.js";

import type {
  RewardDistributorData,
  RewardEntryData,
} from "./programs/rewardDistributor";
import { getRewardEntries } from "./programs/rewardDistributor/accounts";
import { findRewardEntryId } from "./programs/rewardDistributor/pda";
import type { StakeEntryData } from "./programs/stakePool";
import { getStakeEntries } from "./programs/stakePool/accounts";
import { findStakeEntryIdFromMint } from "./programs/stakePool/utils";

export const executeTransaction = async (
  connection: Connection,
  wallet: Wallet,
  transaction: Transaction,
  config: {
    silent?: boolean;
    signers?: Signer[];
    confirmOptions?: ConfirmOptions;
    callback?: (success: boolean) => void;
  }
): Promise<string> => {
  let txid = "";
  try {
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash("max")
    ).blockhash;
    await wallet.signTransaction(transaction);
    if (config.signers && config.signers.length > 0) {
      transaction.partialSign(...config.signers);
    }
    txid = await sendAndConfirmRawTransaction(
      connection,
      transaction.serialize(),
      config.confirmOptions
    );
    config.callback && config.callback(true);
    console.log("Successful tx", txid);
  } catch (e: unknown) {
    console.log("Failed transaction: ", e);
    config.callback && config.callback(false);
    if (!config.silent) {
      throw new Error(`${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return txid;
};

/**
 * Get total supply of mint
 * @param connection
 * @param originalMintId
 * @returns
 */
export const getMintSupply = async (
  connection: web3.Connection,
  originalMintId: web3.PublicKey
): Promise<BN> => {
  const mint = new splToken.Token(
    connection,
    originalMintId,
    splToken.TOKEN_PROGRAM_ID,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    null
  );
  return (await mint.getMintInfo()).supply;
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
): Promise<{
  rewardMap: {
    [mintId: string]: { claimableRewards: BN; nextRewardsIn: BN };
  };
  claimableRewards: BN;
}> => {
  const rewardDistributorTokenAccount = await findAta(
    rewardDistributor.parsed.rewardMint,
    rewardDistributor.pubkey,
    true
  );
  const rewardMint = new splToken.Token(
    connection,
    rewardDistributor.parsed.rewardMint,
    splToken.TOKEN_PROGRAM_ID,
    Keypair.generate() // not used
  );

  const rewardDistributorTokenAccountInfo = await rewardMint.getAccountInfo(
    rewardDistributorTokenAccount
  );

  const entryTuples: [PublicKey, PublicKey][] = await Promise.all(
    mintIds.map(async (mintId) => {
      return [
        (
          await findStakeEntryIdFromMint(
            connection,
            wallet,
            rewardDistributor.parsed.stakePool,
            mintId
          )
        )[0],
        (await findRewardEntryId(rewardDistributor.pubkey, mintId))[0],
      ];
    })
  );

  const entryIds: [PublicKey[], PublicKey[]] = entryTuples.reduce(
    (acc, [stakeEntryID, rewardEntryId]) => [
      [...acc[0], stakeEntryID],
      [...acc[1], rewardEntryId],
    ],
    [[], []] as [PublicKey[], PublicKey[]]
  );

  const [stakeEntries, rewardEntries] = await Promise.all([
    getStakeEntries(connection, entryIds[0]),
    getRewardEntries(connection, entryIds[1]),
  ]);

  return getRewardMap(
    mintIds,
    stakeEntries,
    rewardEntries,
    rewardDistributor,
    rewardDistributorTokenAccountInfo.amount
  );
};

/**
 * Get the map of rewards for mintId to rewards and next reward time
 * Also return the total claimable rewards from this map
 * @param mintIds
 * @param stakeEntries
 * @param rewardEntries
 * @param rewardDistributor
 * @param remainingRewardAmount
 * @returns
 */
export const getRewardMap = (
  mintIds: PublicKey[],
  stakeEntries: AccountData<StakeEntryData>[],
  rewardEntries: AccountData<RewardEntryData>[],
  rewardDistributor: AccountData<RewardDistributorData>,
  remainingRewardAmount: BN
): {
  rewardMap: {
    [mintId: string]: { claimableRewards: BN; nextRewardsIn: BN };
  };
  claimableRewards: BN;
} => {
  const rewardMap: {
    [mintId: string]: { claimableRewards: BN; nextRewardsIn: BN };
  } = {};
  for (let i = 0; i < mintIds.length; i++) {
    const mintId = mintIds[i]!;
    const stakeEntry = stakeEntries.find((stakeEntry) =>
      stakeEntry.parsed.originalMint.equals(mintId)
    );
    const rewardEntry = rewardEntries.find((rewardEntry) =>
      rewardEntry?.parsed?.mint.equals(mintId)
    );

    if (mintId && stakeEntry) {
      const [claimableRewards, nextRewardsIn] = calculatePendingRewards(
        rewardDistributor,
        stakeEntry,
        rewardEntry,
        remainingRewardAmount,
        Date.now() / 1000
      );
      rewardMap[mintId.toString()] = {
        claimableRewards,
        nextRewardsIn,
      };
    }
  }

  // Compute too many rewards
  let claimableRewards = Object.values(rewardMap).reduce(
    (acc, { claimableRewards }) => acc.add(claimableRewards),
    new BN(0)
  );
  if (
    rewardDistributor.parsed.maxSupply &&
    rewardDistributor.parsed.rewardsIssued
      .add(claimableRewards)
      .gte(rewardDistributor.parsed.maxSupply)
  ) {
    claimableRewards = rewardDistributor.parsed.maxSupply.sub(
      rewardDistributor.parsed.rewardsIssued
    );
  }

  if (claimableRewards > remainingRewardAmount) {
    claimableRewards = remainingRewardAmount;
  }
  return { rewardMap, claimableRewards };
};

/**
 * Calculate claimable rewards and next reward time for a give mint and reward and stake entry
 * @param rewardDistributor
 * @param stakeEntry
 * @param rewardEntry
 * @param remainingRewardAmount
 * @param UTCNow
 * @returns
 */
export const calculatePendingRewards = (
  rewardDistributor: AccountData<RewardDistributorData>,
  stakeEntry: AccountData<StakeEntryData>,
  rewardEntry: AccountData<RewardEntryData> | undefined,
  remainingRewardAmount: BN,
  UTCNow: number
): [BN, BN] => {
  if (
    !stakeEntry ||
    stakeEntry.parsed.pool.toString() !==
      rewardDistributor.parsed.stakePool.toString()
  ) {
    return [new BN(0), new BN(0)];
  }

  const rewardSecondsReceived =
    rewardEntry?.parsed.rewardSecondsReceived || new BN(0);
  const multiplier = rewardEntry?.parsed?.multiplier || new BN(1);

  let rewardAmountToReceive = new BN(UTCNow)
    .sub(stakeEntry.parsed.lastStakedAt)
    .add(stakeEntry.parsed.totalStakeSeconds)
    .sub(rewardSecondsReceived)
    .div(rewardDistributor.parsed.rewardDurationSeconds)
    .mul(rewardDistributor.parsed.rewardAmount)
    .mul(multiplier);

  if (
    rewardDistributor.parsed.maxSupply &&
    rewardDistributor.parsed.rewardsIssued
      .add(rewardAmountToReceive)
      .gte(rewardDistributor.parsed.maxSupply)
  ) {
    rewardAmountToReceive = rewardDistributor.parsed.maxSupply.sub(
      rewardDistributor.parsed.rewardsIssued
    );
  }

  if (rewardAmountToReceive > remainingRewardAmount) {
    rewardAmountToReceive = remainingRewardAmount;
  }

  const nextRewardsIn = rewardDistributor.parsed.rewardDurationSeconds.sub(
    new BN(UTCNow)
      .sub(stakeEntry.parsed.lastStakedAt)
      .add(stakeEntry.parsed.totalStakeSeconds)
      .mod(rewardDistributor.parsed.rewardDurationSeconds)
  );

  return [rewardAmountToReceive, nextRewardsIn];
};
