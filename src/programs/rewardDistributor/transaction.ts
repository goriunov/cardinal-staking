import { withFindOrInitAssociatedTokenAccount } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { getRewardDistributor } from "./accounts";
import { claimRewards, initRewardDistributor } from "./instruction";
import { findRewardDistributorId } from "./pda";

export const withInitRewardDistributor = (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    maxSupply: BN;
  }
): Transaction => {
  return transaction.add(initRewardDistributor(connection, wallet, params));
};

export const withClaimRewards = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMint: PublicKey;
    originalMintTokenAccount: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const rewardDistributorData = await getRewardDistributor(
    connection,
    rewardDistributorId
  );

  const rewardMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    rewardDistributorData.parsed.rewardMint,
    wallet.publicKey,
    wallet.publicKey
  );

  transaction.add(
    await claimRewards(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMint: params.originalMint,
      mintTokenAccount: params.originalMintTokenAccount,
      rewardMintId: rewardDistributorData.parsed.rewardMint,
      rewardMintTokenAccountId: rewardMintTokenAccountId,
    })
  );
  return transaction;
};
