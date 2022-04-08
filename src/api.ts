import { tryGetAccount } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";

import { ReceiptType } from "./programs/stakePool";
import { getStakeEntry, getStakePool } from "./programs/stakePool/accounts";
import { findStakeEntryId } from "./programs/stakePool/pda";
import {
  withAuthorizeStakeEntry,
  withClaimReceiptMint,
  withInitFungibleStakeEntry,
  withInitNFTStakeEntry,
  withInitStakeMint,
  withInitStakePool,
  withStake,
  withUnstake,
} from "./programs/stakePool/transaction";
import { getMintSupply } from "./utils";

/**
 * Convenience call to create a stake pool
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param requiresCollections - (Optional) List of required collections pubkeys
 * @param requiresCreators - (Optional) List of required creators pubkeys
 * @param requiresAuthorization - (Optional) Boolean to require authorization
 * @param overlayText - (Optional) Text to overlay on receipt mint tokens
 * @param imageUri - (Optional) Image URI for stake pool
 * @returns
 */
export const createStakePool = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
  }
): Promise<[Transaction, PublicKey]> =>
  withInitStakePool(new Transaction(), connection, wallet, params);

/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
export const createStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    user?: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  const supply = await getMintSupply(connection, params.originalMintId);
  if (supply > 1) {
    return withInitFungibleStakeEntry(new Transaction(), connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
      user: params.user || wallet.publicKey,
    });
  } else {
    return withInitNFTStakeEntry(new Transaction(), connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    });
  }
};

/**
 * Convenience call to authorize a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export const authorizeStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> => {
  return withAuthorizeStakeEntry(new Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });
};

/**
 * Convenience call to create a stake entry and a stake mint
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export const createStakeEntryAndStakeMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    amount?: number;
  }
): Promise<[Transaction, Keypair, PublicKey]> => {
  let transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryId(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    transaction = (
      await createStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
      })
    )[0];
  }

  const stakeMintKeypair = Keypair.generate();
  const stakePool = await getStakePool(connection, params.stakePoolId);

  await withInitStakeMint(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    stakeEntryId: stakeEntryId,
    originalMintId: params.originalMintId,
    stakeMintKeypair,
    name: `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
    symbol: `POOl${stakePool.parsed.identifier.toString()}`,
    amount: params.amount,
  });

  return [transaction, stakeMintKeypair, stakeEntryId];
};

/**
 * Convenience method to stake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @param userOriginalMintTokenAccountId - User's original mint token account id
 * @param receiptType - (Optional) ReceiptType to be received back. If none provided, none will be claimed
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export const stake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    receiptType?: ReceiptType;
    user?: PublicKey;
    amount?: BN;
  }
): Promise<Transaction> => {
  let transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryId(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    [transaction] = await createStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
      user: params.user,
    });
  }

  await withStake(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
    amount: params.amount,
  });

  if (params.receiptType) {
    const receiptMintId =
      params.receiptType === ReceiptType.Receipt &&
      stakeEntryData?.parsed.stakeMint
        ? stakeEntryData?.parsed.stakeMint
        : params.originalMintId;
    await withClaimReceiptMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      receiptMintId: receiptMintId,
      receiptType: params.receiptType,
    });
  }

  return transaction;
};

/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export const unstake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> =>
  withUnstake(new Transaction(), connection, wallet, params);
