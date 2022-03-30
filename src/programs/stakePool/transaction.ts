import {
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { withInvalidate } from "@cardinal/token-manager";
import {
  findMintManagerId,
  findTokenManagerAddress,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import * as metaplex from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type * as web3 from "@solana/web3.js";

import { getRewardDistributor } from "../rewardDistributor/accounts";
import { claimRewards } from "../rewardDistributor/instruction";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import { withRemainingAccountsForKind } from "../rewardDistributor/utils";
import { getPoolIdentifier, getStakeEntry } from "./accounts";
import { StakeType } from "./constants";
import {
  claimReceiptMint,
  initPoolIdentifier,
  initReceiptMint,
  initStakeEntry,
  initStakePool,
  stake,
  unstake,
} from "./instruction";
import { findIdentifierId, findStakeEntryId, findStakePoolId } from "./pda";
import { withRemainingAccountsForStake } from "./utils";

export const withInitPoolIdentifier = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [identifierId] = await findIdentifierId();
  transaction.add(
    initPoolIdentifier(connection, wallet, {
      identifierId: identifierId,
    })
  );
  return [transaction, identifierId];
};

export const withInitStakePool = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    allowedCollections?: web3.PublicKey[];
    allowedCreators?: web3.PublicKey[];
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[web3.Transaction, web3.PublicKey, BN]> => {
  const [identifierId] = await findIdentifierId();
  const identifierData = await tryGetAccount(() =>
    getPoolIdentifier(connection)
  );
  const identifier = identifierData?.parsed.count || new BN(0);

  if (!identifierData) {
    transaction.add(
      initPoolIdentifier(connection, wallet, {
        identifierId: identifierId,
      })
    );
  }

  const [stakePoolId] = await findStakePoolId(identifier);
  transaction.add(
    initStakePool(connection, wallet, {
      identifierId: identifierId,
      stakePoolId: stakePoolId,
      allowedCreators: params.allowedCreators || [],
      allowedCollections: params.allowedCollections || [],
      overlayText: params.overlayText || "",
      imageUri: params.imageUri || "",
      authority: wallet.publicKey,
    })
  );
  return [transaction, stakePoolId, identifier];
};

export const withInitStakeEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [[stakeEntryId], originalMintMetadatId] = await Promise.all([
    findStakeEntryId(params.stakePoolId, params.originalMintId),
    metaplex.Metadata.getPDA(params.originalMintId),
  ]);

  transaction.add(
    initStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      originalMintMetadatId: originalMintMetadatId,
    })
  );
  return [transaction, stakeEntryId];
};

export const withInitReceiptMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    receiptMintKeypair: web3.Keypair;
    name: string;
    symbol: string;
  }
): Promise<[web3.Transaction, web3.Keypair]> => {
  const [
    [stakeEntryId],
    [mintManagerId],
    originalMintMetadataId,
    receiptMintMetadataId,
  ] = await Promise.all([
    findStakeEntryId(params.stakePoolId, params.originalMintId),
    findMintManagerId(params.receiptMintKeypair.publicKey),
    metaplex.Metadata.getPDA(params.originalMintId),
    metaplex.Metadata.getPDA(params.receiptMintKeypair.publicKey),
  ]);

  const stakeEntryReceiptMintTokenAccountId = await findAta(
    params.receiptMintKeypair.publicKey,
    stakeEntryId
  );

  transaction.add(
    initReceiptMint(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      originalMintMetadatId: originalMintMetadataId,
      stakeEntryReceiptMintTokenAccountId: stakeEntryReceiptMintTokenAccountId,
      receiptMintId: params.receiptMintKeypair.publicKey,
      receiptMintMetadataId: receiptMintMetadataId,
      mintManagerId: mintManagerId,
      name: params.name,
      symbol: params.symbol,
    })
  );
  return [transaction, params.receiptMintKeypair];
};

export const withClaimReceiptMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    receiptMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  const [[stakeEntryId]] = await Promise.all([
    findStakeEntryId(params.stakePoolId, params.originalMintId),
  ]);

  const tokenManagerReceiptMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.receiptMintId,
      (
        await findTokenManagerAddress(params.receiptMintId)
      )[0],
      wallet.publicKey,
      true
    );

  transaction.add(
    await claimReceiptMint(connection, wallet, {
      stakeEntryId: stakeEntryId,
      tokenManagerReceiptMintTokenAccountId:
        tokenManagerReceiptMintTokenAccountId,
      receiptMintId: params.receiptMintId,
    })
  );
  return transaction;
};

export const withStake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakeType?: StakeType;
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    userOriginalMintTokenAccountId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  const [stakeEntryId] = await findStakeEntryId(
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const remainingAccounts = await withRemainingAccountsForStake(
    transaction,
    connection,
    wallet,
    params.originalMintId,
    params.stakeType || StakeType.Locked
  );

  transaction.add(
    stake(connection, wallet, {
      stakeType: params.stakeType || StakeType.Locked,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      stakeEntryOriginalMintTokenAccountId:
        stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
      remainingAccounts,
    })
  );

  return transaction;
};

export const withUnstake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  const [[stakeEntryId], [rewardDistributorId]] = await Promise.all([
    findStakeEntryId(params.stakePoolId, params.originalMintId),
    await findRewardDistributorId(params.stakePoolId),
  ]);

  const [
    stakeEntryData,
    rewardDistributorData,
    stakeEntryOriginalMintTokenAccountId,
  ] = await Promise.all([
    tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
    tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId)),
    findAta(params.originalMintId, stakeEntryId, true),
  ]);

  // return receipt mint if its claimed
  if (
    stakeEntryData?.parsed.receiptMint &&
    stakeEntryData.parsed.receiptMintClaimed
  ) {
    await withInvalidate(
      transaction,
      connection,
      wallet,
      stakeEntryData?.parsed.receiptMint
    );
  }
  console.log(
    stakeEntryData,
    stakeEntryData?.parsed.stakeType === StakeType.Locked
  );

  // return original mint if its locked
  if (stakeEntryData?.parsed.stakeType === StakeType.Locked) {
    await withInvalidate(
      transaction,
      connection,
      wallet,
      params.originalMintId
    );
  }

  const userOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      wallet.publicKey,
      wallet.publicKey
    );

  transaction.add(
    unstake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      user: wallet.publicKey,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
    })
  );

  // claim any rewards deserved
  if (rewardDistributorData) {
    const userRewardMintTokenAccountId =
      await withFindOrInitAssociatedTokenAccount(
        transaction,
        connection,
        rewardDistributorData.parsed.rewardMint,
        wallet.publicKey,
        wallet.publicKey
      );
    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );
    transaction.add(
      await claimRewards(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
        mintTokenAccount: userOriginalMintTokenAccountId,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        rewardMintTokenAccountId: userRewardMintTokenAccountId,
        remainingAccountsForKind,
      })
    );
  }

  return transaction;
};
