import type { TokenManagerKind } from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import {
  getRemainingAccountsForKind,
  TOKEN_MANAGER_ADDRESS,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import { MetadataProgram } from "@metaplex-foundation/mpl-token-metadata";
import type { BN } from "@project-serum/anchor";
import { Program, Provider } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import type { STAKE_POOL_PROGRAM } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";

export const initStakePool = (
  connection: Connection,
  wallet: Wallet,
  params: { identifier: BN; stakePoolId: PublicKey }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.initPool(
    {
      identifier: params.identifier,
    },
    {
      accounts: {
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const initStakeEntry = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMint: PublicKey;
    mintTokenAccount: PublicKey;
    mintMetadata: PublicKey;
    mint: PublicKey;
    mintManager: PublicKey;
    name: string;
    symbol: string;
    textOverlay: string;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.initEntry(
    {
      name: params.name,
      symbol: params.symbol,
      textOverlay: params.textOverlay,
    },
    {
      accounts: {
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        originalMint: params.originalMint,
        mint: params.mint,
        mintManager: params.mintManager,
        mintTokenAccount: params.mintTokenAccount,
        mintMetadata: params.mintMetadata,
        payer: wallet.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MetadataProgram.PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const stake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    tokenManagerId: PublicKey;
    mintCounterId: PublicKey;
    stakePoolIdentifier: BN;
    originalMint: PublicKey;
    mint: PublicKey;
    stakeEntryOriginalMintTokenAccount: PublicKey;
    stakeEntryMintTokenAccount: PublicKey;
    user: PublicKey;
    userOriginalMintTokenAccount: PublicKey;
    userMintTokenAccount: PublicKey;
    tokenManagerMintAccount: PublicKey;
    tokenManagerKind: TokenManagerKind;
    claimReceipt: PublicKey | undefined;
  }
): Promise<TransactionInstruction> => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const remainingAccounts = await getRemainingAccountsForKind(
    params.mint,
    params.tokenManagerKind
  );

  return stakePoolProgram.instruction.stake({
    accounts: {
      stakeEntry: params.stakeEntryId,
      originalMint: params.originalMint,
      mint: params.mint,
      tokenManager: params.tokenManagerId,
      mintCounter: params.mintCounterId,
      stakeEntryOriginalMintTokenAccount:
        params.stakeEntryOriginalMintTokenAccount,
      stakeEntryMintTokenAccount: params.stakeEntryMintTokenAccount,
      user: params.user,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccount,
      userMintTokenAccount: params.userMintTokenAccount,
      tokenManagerMintAccount: params.tokenManagerMintAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts: params.claimReceipt
      ? [
          ...remainingAccounts,
          { pubkey: params.claimReceipt, isSigner: false, isWritable: true },
        ]
      : remainingAccounts,
  });
};

export const unstake = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    tokenManagerId: PublicKey;
    mint: PublicKey;
    stakeEntryOriginalMintTokenAccount: PublicKey;
    stakeEntryMintTokenAccount: PublicKey;
    user: PublicKey;
    userOriginalMintTokenAccount: PublicKey;
    userMintTokenAccount: PublicKey;
    tokenManagerMintAccount: PublicKey;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.unstake({
    accounts: {
      stakeEntry: params.stakeEntryId,
      tokenManager: params.tokenManagerId,
      mint: params.mint,
      stakeEntryOriginalMintTokenAccount:
        params.stakeEntryOriginalMintTokenAccount,
      stakeEntryMintTokenAccount: params.stakeEntryMintTokenAccount,
      user: params.user,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccount,
      userMintTokenAccount: params.userMintTokenAccount,
      tokenManagerMintAccount: params.tokenManagerMintAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
    },
  });
};
