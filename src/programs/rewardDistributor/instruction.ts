import type { BN } from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

import { findStakeEntryIdFromMint } from "../stakePool/utils";
import type { REWARD_DISTRIBUTOR_PROGRAM } from ".";
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import type { RewardDistributorKind } from "./constants";
import { REWARD_MANAGER } from "./constants";
import { findRewardDistributorId, findRewardEntryId } from "./pda";

export const initRewardDistributor = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardDistributorId: PublicKey;
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    kind: RewardDistributorKind;
    remainingAccountsForKind: AccountMeta[];
    maxSupply?: BN;
    supply?: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.initRewardDistributor(
    {
      rewardAmount: params.rewardAmount,
      rewardDurationSeconds: params.rewardDurationSeconds,
      maxSupply: params.maxSupply || null,
      supply: params.supply || null,
      kind: params.kind,
    },
    {
      accounts: {
        rewardDistributor: params.rewardDistributorId,
        stakePool: params.stakePoolId,
        rewardMint: params.rewardMintId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      remainingAccounts: params.remainingAccountsForKind,
    }
  );
};

export const initRewardEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    mint: PublicKey;
    rewardDistributor: PublicKey;
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const [rewardEntryId] = await findRewardEntryId(
    params.rewardDistributor,
    params.mint
  );
  return rewardDistributorProgram.instruction.initRewardEntry(
    {
      mint: params.mint,
    },
    {
      accounts: {
        rewardEntry: rewardEntryId,
        rewardDistributor: params.rewardDistributor,
        payer: wallet.publicKey,
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
    originalMintId: PublicKey;
    rewardMintId: PublicKey;
    rewardMintTokenAccountId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const [[rewardEntryId], [stakeEntryId]] = await Promise.all([
    findRewardEntryId(rewardDistributorId, params.originalMintId),
    findStakeEntryIdFromMint(
      connection,
      wallet.publicKey,
      params.stakePoolId,
      params.originalMintId
    ),
  ]);

  return rewardDistributorProgram.instruction.claimRewards({
    accounts: {
      rewardEntry: rewardEntryId,
      rewardDistributor: rewardDistributorId,
      stakeEntry: stakeEntryId,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      userRewardMintTokenAccount: params.rewardMintTokenAccountId,
      rewardManager: REWARD_MANAGER,
      user: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts: params.remainingAccountsForKind,
  });
};

export const closeRewardDistributor = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  return rewardDistributorProgram.instruction.closeRewardDistributor({
    accounts: {
      rewardDistributor: rewardDistributorId,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      signer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: params.remainingAccountsForKind,
  });
};

export const updateRewardEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    mintId: PublicKey;
    multiplier: BN;
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );

  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.mintId
  );

  return rewardDistributorProgram.instruction.updateRewardEntry(
    { multiplier: params.multiplier },
    {
      accounts: {
        rewardEntry: rewardEntryId,
        rewardDistributor: rewardDistributorId,
        authority: wallet.publicKey,
      },
    }
  );
};

export const closeRewardEntry = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardDistributorId: PublicKey;
    rewardEntryId: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  return rewardDistributorProgram.instruction.closeRewardEntry({
    accounts: {
      rewardDistributor: params.rewardDistributorId,
      rewardEntry: params.rewardEntryId,
      authority: wallet.publicKey,
    },
  });
};
