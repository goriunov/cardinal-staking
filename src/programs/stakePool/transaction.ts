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

import { getMintSupply } from "../../utils";
import { getRewardDistributor } from "../rewardDistributor/accounts";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import { withClaimRewards } from "../rewardDistributor/transaction";
import { getPoolIdentifier, getStakeEntry } from "./accounts";
import { ReceiptType } from "./constants";
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

/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
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
    resetOnUnstake?: boolean;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
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
      resetOnUnstake: params.resetOnUnstake || false,
    })
  );
  return [transaction, stakePoolId];
};

/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
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
    findStakeEntryId(
      connection,
      wallet.publicKey,
      params.stakePoolId,
      params.originalMintId
    ),
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

/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
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

/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
export const withInitStakeMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    stakeMintKeypair: web3.Keypair;
    name: string;
    symbol: string;
  }
): Promise<[web3.Transaction, web3.Keypair]> => {
  const [[mintManagerId], originalMintMetadataId, stakeMintMetadataId] =
    await Promise.all([
      findMintManagerId(params.stakeMintKeypair.publicKey),
      metaplex.Metadata.getPDA(params.originalMintId),
      metaplex.Metadata.getPDA(params.stakeMintKeypair.publicKey),
    ]);

  const stakeEntryStakeMintTokenAccountId = await findAta(
    params.stakeMintKeypair.publicKey,
    params.stakeEntryId,
    true
  );

  transaction.add(
    initStakeMint(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
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

/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
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
  if (
    params.receiptType === ReceiptType.Original &&
    (await getMintSupply(connection, params.receiptMintId)) > 1
  ) {
    throw new Error(
      "Fungible staking and locked reecipt type not supported yet"
    );
  }

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

/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withStake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    userOriginalMintTokenAccountId: web3.PublicKey;
    amount?: BN;
  }
): Promise<web3.Transaction> => {
  const [stakeEntryId] = await findStakeEntryId(
    connection,
    wallet.publicKey,
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
      originalMint: params.originalMintId,
      stakeEntryOriginalMintTokenAccountId:
        stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
      amount: params.amount || new BN(1),
    })
  );

  return transaction;
};

/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
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
    findStakeEntryId(
      connection,
      wallet.publicKey,
      params.stakePoolId,
      params.originalMintId
    ),
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
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      user: wallet.publicKey,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
      remainingAccounts,
    })
  );

  // claim any rewards deserved
  if (rewardDistributorData) {
    await withClaimRewards(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMint: params.originalMintId,
    });
  }

  return transaction;
};
