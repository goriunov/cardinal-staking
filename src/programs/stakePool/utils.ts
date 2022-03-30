import { BN, Program, Provider } from "@project-serum/anchor";
import type * as web3 from "@solana/web3.js";

import type {
  REWARD_DISTRIBUTOR_PROGRAM,
  RewardDistributorData,
} from "../rewardDistributor";
import {
  REWARD_DISTRIBUTOR_ADDRESS,
  REWARD_DISTRIBUTOR_IDL,
} from "../rewardDistributor";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import type { STAKE_POOL_PROGRAM } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import type { IdentifierData, StakeEntryData } from "./constants";
import { findIdentifierId, findStakeEntryId } from "./pda";

export const checkIfIdentifierExists = async (
  connection: web3.Connection
): Promise<[boolean, BN]> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  try {
    const [identifierId] = await findIdentifierId();
    const parsed = (await stakePoolProgram.account.identifier.fetch(
      identifierId
    )) as IdentifierData;
    return [true, parsed.count];
  } catch (e) {
    return [false, new BN(0)];
  }
};

export const getTotalStakeSeconds = async (
  connection: web3.Connection,
  stakePoolId: web3.PublicKey,
  mintId: web3.PublicKey
): Promise<BN> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  const [stakeEntryId] = await findStakeEntryId(stakePoolId, mintId);
  const parsed = (await stakePoolProgram.account.stakeEntry.fetch(
    stakeEntryId
  )) as StakeEntryData;
  return parsed.totalStakeSeconds;
};

export const getActiveStakeSeconds = async (
  connection: web3.Connection,
  stakePoolId: web3.PublicKey,
  mintId: web3.PublicKey
): Promise<BN> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  const [stakeEntryId] = await findStakeEntryId(stakePoolId, mintId);
  const parsed = (await stakePoolProgram.account.stakeEntry.fetch(
    stakeEntryId
  )) as StakeEntryData;

  const UTCNow = Math.floor(Date.now() / 1000);
  const lastStakedAt = parsed.lastStakedAt.toNumber() || UTCNow;
  return parsed.lastStaker ? new BN(UTCNow - lastStakedAt) : new BN(0);
};

export const getUnclaimedRewards = async (
  connection: web3.Connection,
  stakePoolId: web3.PublicKey
): Promise<BN> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const rewardDistributor = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
  const parsed = (await rewardDistributor.account.rewardDistributor.fetch(
    rewardDistributorId
  )) as RewardDistributorData;
  return parsed.maxSupply
    ? new BN(parsed.maxSupply?.toNumber() - parsed.rewardsIssued.toNumber())
    : new BN(0);
};

export const getClaimedRewards = async (
  connection: web3.Connection,
  stakePoolId: web3.PublicKey
): Promise<BN> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const rewardDistributor = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
  const parsed = (await rewardDistributor.account.rewardDistributor.fetch(
    rewardDistributorId
  )) as RewardDistributorData;
  return parsed.rewardsIssued;
};
