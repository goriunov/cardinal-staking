import { Wallet } from "@metaplex/js";
import { BN } from "@project-serum/anchor";
import { Program, Provider } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";

import { MetadataProgram } from "@metaplex-foundation/mpl-token-metadata";
import type { STAKE_POOL_PROGRAM } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import {
  getRemainingAccountsForKind,
  TokenManagerKind,
  TOKEN_MANAGER_ADDRESS,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager";

export const initStakePool = (
  connection: web3.Connection,
  wallet: Wallet,
  params: { identifier: BN; stakePoolId: web3.PublicKey }
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
        systemProgram: web3.SystemProgram.programId,
      },
    }
  );
};

export const initStakeEntry = (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    originalMint: web3.PublicKey;
    mintTokenAccount: web3.PublicKey;
    mintMetadata: web3.PublicKey;
    mint: web3.PublicKey;
    mintManager: web3.PublicKey;
    name: String;
    symbol: String;
    textOverlay: String;
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
        rent: web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MetadataProgram.PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
    }
  );
};

export const stake = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: web3.PublicKey;
    tokenManagerId: web3.PublicKey;
    mintCounterId: web3.PublicKey;
    stakePoolIdentifier: BN;
    originalMint: web3.PublicKey;
    mint: web3.PublicKey;
    stakeEntryOriginalMintTokenAccount: web3.PublicKey;
    stakeEntryMintTokenAccount: web3.PublicKey;
    user: web3.PublicKey;
    userOriginalMintTokenAccount: web3.PublicKey;
    userMintTokenAccount: web3.PublicKey;
    tokenManagerMintAccount: web3.PublicKey;
    tokenManagerKind: TokenManagerKind;
    claimReceipt: web3.PublicKey | undefined;
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
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
    },
    remainingAccounts: params.claimReceipt
      ? [
          ...remainingAccounts,
          { pubkey: params.claimReceipt, isSigner: false, isWritable: true },
        ]
      : remainingAccounts,
  });
};

export const unstake = async (
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: web3.PublicKey;
    tokenManagerId: web3.PublicKey;
    mint: web3.PublicKey;
    stakeEntryOriginalMintTokenAccount: web3.PublicKey;
    stakeEntryMintTokenAccount: web3.PublicKey;
    user: web3.PublicKey;
    userOriginalMintTokenAccount: web3.PublicKey;
    userMintTokenAccount: web3.PublicKey;
    tokenManagerMintAccount: web3.PublicKey;
  }
): Promise<TransactionInstruction> => {
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
