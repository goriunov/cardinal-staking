import { findAta } from "@cardinal/common";
import {
  getRemainingAccountsForKind,
  TOKEN_MANAGER_ADDRESS,
  TokenManagerKind,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import {
  findMintCounterId,
  findTokenManagerAddress,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import { MetadataProgram } from "@metaplex-foundation/mpl-token-metadata";
import { Program, Provider } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import type { STAKE_POOL_PROGRAM } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import type { StakeType } from "./constants";

export const initPoolIdentifier = (
  connection: Connection,
  wallet: Wallet,
  params: {
    identifierId: PublicKey;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.initIdentifier({
    accounts: {
      identifier: params.identifierId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};

export const initStakePool = (
  connection: Connection,
  wallet: Wallet,
  params: {
    identifierId: PublicKey;
    stakePoolId: PublicKey;
    allowedCreators: PublicKey[];
    allowedCollections: PublicKey[];
    overlayText: string;
    imageUri: string;
    authority: PublicKey;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.initPool(
    {
      overlayText: params.overlayText,
      imageUri: params.imageUri,
      allowedCollections: params.allowedCollections,
      allowedCreators: params.allowedCreators,
      authority: params.authority,
    },
    {
      accounts: {
        stakePool: params.stakePoolId,
        identifier: params.identifierId,
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
    originalMintId: PublicKey;
    originalMintMetadatId: PublicKey;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.initEntry({
    accounts: {
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      originalMint: params.originalMintId,
      originalMintMetadata: params.originalMintMetadatId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};

export const initReceiptMint = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    originalMintMetadatId: PublicKey;
    stakeEntryReceiptMintTokenAccountId: PublicKey;
    receiptMintMetadataId: PublicKey;
    receiptMintId: PublicKey;
    mintManagerId: PublicKey;
    name: string;
    symbol: string;
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.initReceiptMint(
    { name: params.name, symbol: params.symbol },
    {
      accounts: {
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        originalMint: params.originalMintId,
        originalMintMetadata: params.originalMintMetadatId,
        receiptMint: params.receiptMintId,
        receiptMintMetadata: params.receiptMintMetadataId,
        stakeEntryReceiptMintTokenAccount:
          params.stakeEntryReceiptMintTokenAccountId,
        mintManager: params.mintManagerId,
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

export const claimReceiptMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    tokenManagerReceiptMintTokenAccountId: PublicKey;
    receiptMintId: PublicKey;
  }
): Promise<TransactionInstruction> => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const [
    [tokenManagerId],
    [mintCounterId],
    stakeEntryReceiptMintTokenAccountId,
    userReceiptMintTokenAccountId,
    remainingAccounts,
  ] = await Promise.all([
    findTokenManagerAddress(params.receiptMintId),
    findMintCounterId(params.receiptMintId),
    findAta(params.receiptMintId, params.stakeEntryId, true),
    findAta(params.receiptMintId, wallet.publicKey),
    getRemainingAccountsForKind(params.receiptMintId, TokenManagerKind.Managed),
  ]);

  return stakePoolProgram.instruction.claimReceiptMint({
    accounts: {
      stakeEntry: params.stakeEntryId,
      receiptMint: params.receiptMintId,
      stakeEntryReceiptMintTokenAccount: stakeEntryReceiptMintTokenAccountId,
      user: wallet.publicKey,
      userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
      mintCounter: mintCounterId,
      tokenManager: tokenManagerId,
      tokenManagerReceiptMintTokenAccount:
        params.tokenManagerReceiptMintTokenAccountId,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    },
    remainingAccounts,
  });
};

export const stake = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeType: StakeType;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    stakeEntryOriginalMintTokenAccountId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    remainingAccounts: AccountMeta[];
  }
): TransactionInstruction => {
  const provider = new Provider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.stake(params.stakeType, {
    accounts: {
      stakeEntry: params.stakeEntryId,
      originalMint: params.originalMintId,
      stakeEntryOriginalMintTokenAccount:
        params.stakeEntryOriginalMintTokenAccountId,
      user: wallet.publicKey,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccountId,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: params.remainingAccounts,
  });
};

export const unstake = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    stakeEntryOriginalMintTokenAccount: PublicKey;
    userOriginalMintTokenAccount: PublicKey;
    user: PublicKey;
    remainingAccounts: AccountMeta[];
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
      stakeEntryOriginalMintTokenAccount:
        params.stakeEntryOriginalMintTokenAccount,
      user: params.user,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: params.remainingAccounts,
  });
};
