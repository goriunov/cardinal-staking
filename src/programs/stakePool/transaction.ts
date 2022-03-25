import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import * as web3 from "@solana/web3.js";
import * as metaplex from "@metaplex-foundation/mpl-token-metadata";

import { initStakeEntry, initStakePool, stake, unstake } from "./instruction";
import { findStakeEntryId, findStakePoolId } from "./pda";
import {
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import {
  findMintCounterId,
  findMintManagerId,
  findTokenManagerAddress,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import { TokenManagerKind } from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import { withInvalidate } from "@cardinal/token-manager";

export const withCreatePool = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    identifier: BN;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [stakePoolId] = await findStakePoolId(params.identifier);
  transaction.add(
    initStakePool(connection, wallet, {
      identifier: params.identifier,
      stakePoolId: stakePoolId,
    })
  );
  return [transaction, stakePoolId];
};

export const withCreateEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    mint: web3.Keypair;
    stakePoolIdentifier: BN;
    originalMint: web3.PublicKey;
    name: String;
    symbol: String;
    textOverlay: string;
  }
): Promise<[web3.Transaction, web3.PublicKey, web3.Keypair]> => {
  const [[stakePoolId], [stakeEntryId], [mintManager]] = await Promise.all([
    findStakePoolId(params.stakePoolIdentifier),
    findStakeEntryId(params.stakePoolIdentifier, params.originalMint),
    findMintManagerId(params.mint.publicKey),
  ]);

  const mintTokenAccount = await findAta(
    params.mint.publicKey,
    stakeEntryId,
    true
  );

  const [mintMetadataId] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from(metaplex.MetadataProgram.PREFIX),
      metaplex.MetadataProgram.PUBKEY.toBuffer(),
      params.mint.publicKey.toBuffer(),
    ],
    metaplex.MetadataProgram.PUBKEY
  );

  transaction.add(
    initStakeEntry(connection, wallet, {
      stakePoolId: stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMint: params.originalMint,
      mintTokenAccount: mintTokenAccount,
      mintMetadata: mintMetadataId,
      mint: params.mint.publicKey,
      mintManager: mintManager,
      name: params.name,
      symbol: params.symbol,
      textOverlay: params.textOverlay,
    })
  );
  return [transaction, stakeEntryId, params.mint];
};

export const withStake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolIdentifier: BN;
    originalMint: web3.PublicKey;
    mint: web3.PublicKey;
    claimReicipt?: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [[stakeEntryId], [tokenManagerId], [mintCounterId]] = await Promise.all(
    [
      findStakeEntryId(params.stakePoolIdentifier, params.originalMint),
      findTokenManagerAddress(params.mint),
      findMintCounterId(params.mint),
    ]
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
    params.mint,
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
    params.mint,
    stakeEntryId,
    wallet.publicKey,
    true
  );

  const tokenManagerMintAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.mint,
    tokenManagerId,
    wallet.publicKey,
    true
  );

  transaction.add(
    await stake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      stakePoolIdentifier: params.stakePoolIdentifier,
      originalMint: params.originalMint,
      tokenManagerId: tokenManagerId,
      mintCounterId: mintCounterId,
      mint: params.mint,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccount,
      stakeEntryMintTokenAccount: stakeEntryMintTokenAccount,
      user: wallet.publicKey,
      userOriginalMintTokenAccount: userOriginalMintTokenAccount,
      userMintTokenAccount: userMintTokenAccount,
      tokenManagerMintAccount: tokenManagerMintAccount,
      tokenManagerKind: TokenManagerKind.Managed,
      claimReceipt: params.claimReicipt,
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
    mint: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [[stakeEntryId], [tokenManagerId]] = await Promise.all([
    findStakeEntryId(params.stakePoolIdentifier, params.originalMint),
    findTokenManagerAddress(params.mint),
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
    params.mint,
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
    params.mint,
    wallet.publicKey,
    wallet.publicKey
  );

  const tokenManagerMintAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    params.mint,
    tokenManagerId,
    wallet.publicKey,
    true
  );

  await withInvalidate(transaction, connection, wallet, params.mint);

  transaction.add(
    await unstake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      tokenManagerId: tokenManagerId,
      mint: params.mint,
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
