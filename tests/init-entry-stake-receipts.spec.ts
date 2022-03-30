import { findAta } from "@cardinal/common";
import type { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import { SolanaProvider, TransactionEnvelope } from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { expect } from "chai";

import { stake, unstake } from "../src";
import { StakeType } from "../src/programs/stakePool";
import {
  getStakeEntry,
  getStakePool,
} from "../src/programs/stakePool/accounts";
import {
  findStakeEntryId,
  findStakePoolId,
} from "../src/programs/stakePool/pda";
import {
  withInitReceiptMint,
  withInitStakeEntry,
  withInitStakePool,
} from "../src/programs/stakePool/transaction";
import { createMint } from "./utils";
import { getProvider } from "./workspace";

describe("Create stake pool", () => {
  let poolIdentifier: BN;
  let stakePoolId: web3.PublicKey;
  let originalMintTokenAccountId: web3.PublicKey;
  let originalMint: splToken.Token;
  const receiptMintName = "NAME";
  const receiptMintSymbol = "SYMBOL";
  const receiptMintKeypair = web3.Keypair.generate();
  const originalMintAuthority = web3.Keypair.generate();

  before(async () => {
    const provider = getProvider();
    // original mint
    [originalMintTokenAccountId, originalMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey
    );
  });

  it("Create Pool", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    [, , poolIdentifier] = await withInitStakePool(
      transaction,
      provider.connection,
      provider.wallet,
      {}
    );

    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...transaction.instructions,
      ]),
      "Create pool"
    ).to.be.fulfilled;

    [stakePoolId] = await findStakePoolId(poolIdentifier);
    const stakePoolData = await getStakePool(provider.connection, stakePoolId);

    expect(stakePoolData.parsed.identifier.toNumber()).to.eq(
      poolIdentifier.toNumber()
    );
  });

  it("Init stake entry for pool", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withInitStakeEntry(
      transaction,
      provider.connection,
      provider.wallet,
      {
        stakePoolId: stakePoolId,
        originalMintId: originalMint.publicKey,
      }
    );

    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...transaction.instructions,
      ]),
      "Init stake entry"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryId(stakePoolId, originalMint.publicKey)
      )[0]
    );

    expect(stakeEntryData.parsed.originalMint.toString()).to.eq(
      originalMint.publicKey.toString()
    );
    expect(stakeEntryData.parsed.pool.toString()).to.eq(stakePoolId.toString());
    expect(stakeEntryData.parsed.receiptMint).to.eq(null);
  });

  it("Init receipt mint", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withInitReceiptMint(
      transaction,
      provider.connection,
      provider.wallet,
      {
        stakePoolId: stakePoolId,
        originalMintId: originalMint.publicKey,
        receiptMintKeypair: receiptMintKeypair,
        name: receiptMintName,
        symbol: receiptMintSymbol,
      }
    );

    await expectTXTable(
      new TransactionEnvelope(
        SolanaProvider.init(provider),
        [...transaction.instructions],
        [receiptMintKeypair]
      ),
      "Init receipt mint"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryId(stakePoolId, originalMint.publicKey)
      )[0]
    );

    expect(stakeEntryData.parsed.originalMint.toString()).to.eq(
      originalMint.publicKey.toString()
    );
    expect(stakeEntryData.parsed.pool.toString()).to.eq(stakePoolId.toString());
    expect(stakeEntryData.parsed.receiptMint).to.not.eq(null);
  });

  it("Stake", async () => {
    const provider = getProvider();
    const [transaction] = await stake(provider.connection, provider.wallet, {
      stakeType: StakeType.Escrow,
      stakePoolId: stakePoolId,
      originalMintId: originalMint.publicKey,
      userOriginalMintTokenAccountId: originalMintTokenAccountId,
      receipt: {
        name: receiptMintName,
        symbol: receiptMintSymbol,
      },
    });
    await expectTXTable(
      new TransactionEnvelope(
        SolanaProvider.init(provider),
        transaction.instructions
      ),
      "Stake"
    ).to.be.fulfilled;
    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryId(stakePoolId, originalMint.publicKey)
      )[0]
    );

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    const userReceiptMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      provider.wallet.publicKey,
      true
    );

    const stakeEntryOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      stakeEntryData.pubkey,
      true
    );

    const stakeEntryReceiptMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      stakeEntryData.pubkey,
      true
    );

    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.be.greaterThan(0);
    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );

    const receiptMint = new splToken.Token(
      provider.connection,
      receiptMintKeypair.publicKey,
      splToken.TOKEN_PROGRAM_ID,
      web3.Keypair.generate()
    );

    const checkUserReceiptMintTokenAccount = await receiptMint.getAccountInfo(
      userReceiptMintTokenAccountId
    );
    expect(checkUserReceiptMintTokenAccount.amount.toNumber()).to.eq(1);

    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(0);

    const checkStakeEntryOriginalMintTokenAccount =
      await originalMint.getAccountInfo(stakeEntryOriginalMintTokenAccountId);
    expect(checkStakeEntryOriginalMintTokenAccount.amount.toNumber()).to.eq(1);

    const checkStakeEntryReceiptMintTokenAccount =
      await receiptMint.getAccountInfo(stakeEntryReceiptMintTokenAccountId);
    expect(checkStakeEntryReceiptMintTokenAccount.amount.toNumber()).to.eq(0);
  });

  it("Unstake", async () => {
    const provider = getProvider();
    await expectTXTable(
      new TransactionEnvelope(SolanaProvider.init(provider), [
        ...(
          await unstake(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMint.publicKey,
          })
        ).instructions,
      ]),
      "Unstake"
    ).to.be.fulfilled;

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      (
        await findStakeEntryId(stakePoolId, originalMint.publicKey)
      )[0]
    );

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    const userReceiptMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      provider.wallet.publicKey,
      true
    );

    const stakeEntryOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      stakeEntryData.pubkey,
      true
    );

    const stakeEntryReceiptMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      stakeEntryData.pubkey,
      true
    );

    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.be.greaterThan(0);
    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );

    const receiptMint = new splToken.Token(
      provider.connection,
      receiptMintKeypair.publicKey,
      splToken.TOKEN_PROGRAM_ID,
      web3.Keypair.generate()
    );

    const checkUserReceiptMintTokenAccount = await receiptMint.getAccountInfo(
      userReceiptMintTokenAccountId
    );
    expect(checkUserReceiptMintTokenAccount.amount.toNumber()).to.eq(0);

    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);

    const checkStakeEntryOriginalMintTokenAccount =
      await originalMint.getAccountInfo(stakeEntryOriginalMintTokenAccountId);
    expect(checkStakeEntryOriginalMintTokenAccount.amount.toNumber()).to.eq(0);

    const checkStakeEntryReceiptMintTokenAccount =
      await receiptMint.getAccountInfo(stakeEntryReceiptMintTokenAccountId);
    expect(checkStakeEntryReceiptMintTokenAccount.amount.toNumber()).to.eq(1);
  });
});
