import type { AccountData } from "@cardinal/common";
import { findAta, tryGetAccount } from "@cardinal/common";
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
import { sendAndConfirmRawTransaction } from "@solana/web3.js";

import type { RewardDistributorData } from "./programs/rewardDistributor";
import { getRewardEntry } from "./programs/rewardDistributor/accounts";
import { findRewardEntryId } from "./programs/rewardDistributor/pda";
import { getStakeEntry } from "./programs/stakePool/accounts";
import { findStakeEntryId } from "./programs/stakePool/pda";

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
