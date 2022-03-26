import {
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { withInvalidate } from "@cardinal/token-manager";
import { TokenManagerKind } from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import {
  findMintCounterId,
  findMintManagerId,
  findTokenManagerAddress,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import * as metaplex from "@metaplex-foundation/mpl-token-metadata";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type * as web3 from "@solana/web3.js";

import { initStakeEntry, initStakePool, stake, unstake } from "./instruction";
import {
  findStakeEntryId,
  findStakeEntryIdForPool,
  findStakePoolId,
} from "./pda";

export const withCreatePool = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    identifier: BN;
    allowedCollections?: web3.PublicKey[];
    allowedCreators?: web3.PublicKey[];
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [stakePoolId] = await findStakePoolId(params.identifier);
  transaction.add(
    initStakePool(connection, wallet, {
      identifier: params.identifier,
      stakePoolId: stakePoolId,
      allowedCollections: params.allowedCollections || [],
      allowedCreators: params.allowedCreators || [],
      overlayText: params.overlayText || "",
      imageUri: params.imageUri || "",
    })
  );
  return [transaction, stakePoolId];
};

export const withCreateEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    receiptMintKeypair: web3.Keypair;
    stakePoolIdentifier: BN;
    originalMint: web3.PublicKey;
    name: string;
    symbol: string;
  }
): Promise<[web3.Transaction, web3.PublicKey, web3.Keypair]> => {
  const [[stakePoolId], [stakeEntryId], [mintManager]] = await Promise.all([
    findStakePoolId(params.stakePoolIdentifier),
    findStakeEntryIdForPool(params.stakePoolIdentifier, params.originalMint),
    findMintManagerId(params.receiptMintKeypair.publicKey),
  ]);

  const mintTokenAccount = await findAta(
    params.receiptMintKeypair.publicKey,
    stakeEntryId,
    true
  );

  const [receiptMintMetadataId, originalMintMetadatId] = await Promise.all([
    metaplex.Metadata.getPDA(params.receiptMintKeypair.publicKey),
    metaplex.Metadata.getPDA(params.originalMint),
  ]);

  transaction.add(
    initStakeEntry(connection, wallet, {
      stakePoolId: stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMint,
      originalMintMetadatId: originalMintMetadatId,
      stakeEntryReceiptMintTokenAccountId: mintTokenAccount,
      receiptMintMetadataId: receiptMintMetadataId,
      receiptMintId: params.receiptMintKeypair.publicKey,
      mintManager: mintManager,
      name: params.name,
      symbol: params.symbol,
    })
  );
  return [transaction, stakeEntryId, params.receiptMintKeypair];
};

export const withStake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolIdentifier: BN;
    originalMint: web3.PublicKey;
    receiptMint: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [stakePoolId] = await findStakePoolId(params.stakePoolIdentifier);
  const [
    [stakeEntryId],
    originalMintMetadataId,
    [tokenManagerId],
    [mintCounterId],
  ] = await Promise.all([
    findStakeEntryId(stakePoolId, params.originalMint),
    metaplex.Metadata.getPDA(params.originalMint),
    findTokenManagerAddress(params.receiptMint),
    findMintCounterId(params.receiptMint),
  ]);

  const userOriginalMintTokenAccount =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMint,
      wallet.publicKey,
      wallet.publicKey
    );

  const userMintTokenAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.receiptMint,
    wallet.publicKey,
    wallet.publicKey
  );

  const stakeEntryOriginalMintTokenAccount =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMint,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const stakeEntryMintTokenAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.receiptMint,
    stakeEntryId,
    wallet.publicKey,
    true
  );

  const tokenManagerMintAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.receiptMint,
    tokenManagerId,
    wallet.publicKey,
    true
  );

  transaction.add(
    await stake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      stakePoolId: stakePoolId,
      originalMintId: params.originalMint,
      originalMintMetadataId: originalMintMetadataId,
      tokenManagerId: tokenManagerId,
      mintCounterId: mintCounterId,
      receiptMintId: params.receiptMint,
      stakeEntryOriginalMintTokenAccountId: stakeEntryOriginalMintTokenAccount,
      stakeEntryReceiptMintTokenAccountId: stakeEntryMintTokenAccount,
      user: wallet.publicKey,
      userOriginalMintTokenAccountId: userOriginalMintTokenAccount,
      userReceiptMintTokenAccountId: userMintTokenAccount,
      tokenManagerMintAccountId: tokenManagerMintAccount,
      tokenManagerKind: TokenManagerKind.Managed,
    })
  );

  return [transaction, tokenManagerId];
};

export const withUnstake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolIdentifier: BN;
    originalMint: web3.PublicKey;
    receiptMint: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [[stakeEntryId], [tokenManagerId]] = await Promise.all([
    findStakeEntryIdForPool(params.stakePoolIdentifier, params.originalMint),
    findTokenManagerAddress(params.receiptMint),
  ]);

  const stakeEntryOriginalMintTokenAccount =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMint,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const stakeEntryMintTokenAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.receiptMint,
    stakeEntryId,
    wallet.publicKey,
    true
  );

  const userOriginalMintTokenAccount =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMint,
      wallet.publicKey,
      wallet.publicKey
    );

  const userMintTokenAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.receiptMint,
    wallet.publicKey,
    wallet.publicKey
  );

  const tokenManagerMintAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.receiptMint,
    tokenManagerId,
    wallet.publicKey,
    true
  );

  await withInvalidate(transaction, connection, wallet, params.receiptMint);

  transaction.add(
    unstake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      tokenManagerId: tokenManagerId,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccount,
      stakeEntryMintTokenAccount: stakeEntryMintTokenAccount,
      user: wallet.publicKey,
      userOriginalMintTokenAccount: userOriginalMintTokenAccount,
      userMintTokenAccount: userMintTokenAccount,
      tokenManagerMintAccount: tokenManagerMintAccount,
    })
  );

  return [transaction, stakeEntryId];
};
