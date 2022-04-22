import type { AccountData } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";

import type { REWARD_DISTRIBUTOR_PROGRAM } from ".";
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import type { RewardDistributorData, RewardEntryData } from "./constants";

export const getRewardEntry = async (
  connection: Connection,
  rewardEntryId: PublicKey
): Promise<AccountData<RewardEntryData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const parsed = (await rewardDistributorProgram.account.rewardEntry.fetch(
    rewardEntryId
  )) as RewardEntryData;
  return {
    parsed,
    pubkey: rewardEntryId,
  };
};

export const getRewardEntries = async (
  connection: Connection,
  rewardEntryIds: PublicKey[]
): Promise<AccountData<RewardEntryData>[]> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const stakeEntries =
    (await rewardDistributorProgram.account.rewardEntry.fetchMultiple(
      rewardEntryIds
    )) as RewardEntryData[];
  return stakeEntries.map((tm, i) => ({
    parsed: tm,
    pubkey: rewardEntryIds[i]!,
  }));
};

export const getRewardDistributor = async (
  connection: Connection,
  rewardDistributorId: PublicKey
): Promise<AccountData<RewardDistributorData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const parsed =
    (await rewardDistributorProgram.account.rewardDistributor.fetch(
      rewardDistributorId
    )) as RewardDistributorData;
  return {
    parsed,
    pubkey: rewardDistributorId,
  };
};

export const getRewardDistributors = async (
  connection: Connection,
  rewardDistributorIds: PublicKey[]
): Promise<AccountData<RewardDistributorData>[]> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const stakeEntries =
    (await rewardDistributorProgram.account.rewardDistributor.fetchMultiple(
      rewardDistributorIds
    )) as RewardDistributorData[];
  return stakeEntries.map((tm, i) => ({
    parsed: tm,
    pubkey: rewardDistributorIds[i]!,
  }));
};
