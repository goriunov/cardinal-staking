import {
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
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
import type { ReceiptType } from "./constants";
import {
  authorizeStakeEntry,
  claimReceiptMint,
  initPoolIdentifier,
  initStakeEntry,
  initStakeMint,
  initStakePool,
  stake,
  unstake,
} from "./instruction";
import { findIdentifierId, findStakeEntryId, findStakePoolId } from "./pda";
import { withInvalidate } from "./token-manager";
import { withRemainingAccountsForUnstake } from "./utils";

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
    requiresCollections?: web3.PublicKey[];
    requiresCreators?: web3.PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[web3.Transaction, web3.PublicKey, BN]> => {
  const [identifierId] = await findIdentifierId();
  const identifierData = await tryGetAccount(() =>
    getPoolIdentifier(connection)
  );
  const identifier = identifierData?.parsed.count || new BN(1);

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
      requiresCreators: params.requiresCreators || [],
      requiresCollections: params.requiresCollections || [],
      requiresAuthorization: params.requiresAuthorization,
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
    await initStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      originalMintMetadatId: originalMintMetadatId,
    })
  );
  return [transaction, stakeEntryId];
};

export const withAuthorizeStakeEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  transaction.add(
    await authorizeStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    })
  );
  return transaction;
};

export const withInitStakeMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    stakeMintKeypair: web3.Keypair;
    name: string;
    symbol: string;
  }
): Promise<[web3.Transaction, web3.Keypair]> => {
  const [
    [stakeEntryId],
    [mintManagerId],
    originalMintMetadataId,
    stakeMintMetadataId,
  ] = await Promise.all([
    findStakeEntryId(params.stakePoolId, params.originalMintId),
    findMintManagerId(params.stakeMintKeypair.publicKey),
    metaplex.Metadata.getPDA(params.originalMintId),
    metaplex.Metadata.getPDA(params.stakeMintKeypair.publicKey),
  ]);

  const stakeEntryStakeMintTokenAccountId = await findAta(
    params.stakeMintKeypair.publicKey,
    stakeEntryId,
    true
  );

  transaction.add(
    initStakeMint(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      originalMintMetadatId: originalMintMetadataId,
      stakeEntryStakeMintTokenAccountId: stakeEntryStakeMintTokenAccountId,
      stakeMintId: params.stakeMintKeypair.publicKey,
      stakeMintMetadataId: stakeMintMetadataId,
      mintManagerId: mintManagerId,
      name: params.name,
      symbol: params.symbol,
    })
  );
  return [transaction, params.stakeMintKeypair];
};

export const withClaimReceiptMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    receiptMintId: web3.PublicKey;
    receiptType: ReceiptType;
  }
): Promise<web3.Transaction> => {
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
      stakeEntryId: params.stakeEntryId,
      tokenManagerReceiptMintTokenAccountId:
        tokenManagerReceiptMintTokenAccountId,
      receiptMintId: params.receiptMintId,
      receiptType: params.receiptType,
    })
  );
  return transaction;
};

export const withStake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
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

  transaction.add(
    stake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      stakeEntryOriginalMintTokenAccountId:
        stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
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

  const [stakeEntryData, rewardDistributorData] = await Promise.all([
    tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
    tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId)),
  ]);

  // return receipt mint if its claimed
  if (
    stakeEntryData?.parsed.stakeMint &&
    stakeEntryData.parsed.stakeMintClaimed
  ) {
    await withInvalidate(
      transaction,
      connection,
      wallet,
      stakeEntryData?.parsed.stakeMint
    );
  }

  // return original mint if its locked
  if (stakeEntryData?.parsed.originalMintClaimed) {
    await withInvalidate(
      transaction,
      connection,
      wallet,
      params.originalMintId
    );
  }

  const stakeEntryOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const userOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      wallet.publicKey,
      wallet.publicKey
    );

  const remainingAccounts = await withRemainingAccountsForUnstake(
    transaction,
    connection,
    wallet,
    stakeEntryId,
    stakeEntryData?.parsed.stakeMint
  );

  transaction.add(
    unstake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      user: wallet.publicKey,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
      remainingAccounts,
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
