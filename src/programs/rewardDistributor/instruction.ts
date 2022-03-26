import type { BN } from "@project-serum/anchor";
import { Program, Provider } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

import { findStakeEntryId } from "../stakePool/pda";
import type { REWARD_DISTRIBUTOR_PROGRAM } from ".";
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import { findRewardDistributorId, findRewardEntryId } from "./pda";

export const initRewardDistributor = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    maxSupply: BN;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const rewardDistributorId = findRewardDistributorId(params.stakePoolId);
  return rewardDistributorProgram.instruction.initRewardDistributor(
    {
      rewardAmount: params.rewardAmount,
      rewardDurationSeconds: params.rewardDurationSeconds,
      maxSupply: params.maxSupply,
    },
    {
      accounts: {
        rewardDistributor: rewardDistributorId,
        stakePool: params.stakePoolId,
        rewardMint: params.rewardMintId,
        freezeAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const claimRewards = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMint: PublicKey;
    mintTokenAccount: PublicKey;
    rewardMintId: PublicKey;
    rewardMintTokenAccountId: PublicKey;
  }
): Promise<TransactionInstruction> => {
  const provider = new Provider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const [[rewardEntryId], [stakeEntryId]] = await Promise.all([
    findRewardEntryId(rewardDistributorId, params.originalMint),
    findStakeEntryId(params.stakePoolId, params.originalMint),
  ]);

  return rewardDistributorProgram.instruction.claimRewards(
    params.originalMint,
    {
      accounts: {
        rewardEntry: rewardEntryId,
        rewardDistributor: rewardDistributorId,
        stakeEntry: stakeEntryId,
        stakePool: params.stakePoolId,
        mintTokenAccount: params.mintTokenAccount,
        rewardMint: params.rewardMintId,
        userRewardMintTokenAccount: params.rewardMintTokenAccountId,
        user: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};
