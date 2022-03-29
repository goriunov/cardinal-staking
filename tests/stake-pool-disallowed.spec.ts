import type { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import type * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { expect } from "chai";

import { getStakePool } from "../src/programs/stakePool/accounts";
import { findStakePoolId } from "../src/programs/stakePool/pda";
import {
  withCreateEntry,
  withCreatePool,
} from "../src/programs/stakePool/transaction";
import { createMasterEditionIxs, createMint } from "./utils";
import { getProvider } from "./workspace";

describe("Create stake pool", () => {
  let poolIdentifier: BN;
  const entryName = "name";
  const symbol = "symbol";
  const overlayText = "staking";
  let originalMint: splToken.Token;
  const receiptMintKeypair = web3.Keypair.generate();
  const originalMintAuthority = web3.Keypair.generate();

  before(async () => {
    const provider = getProvider();
    // original mint
    [, originalMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      1,
      originalMintAuthority.publicKey
    );

    // master edition
    const ixs = await createMasterEditionIxs(
      originalMint.publicKey,
      originalMintAuthority.publicKey
    );
    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: new SignerWallet(originalMintAuthority),
        opts: provider.opts,
      }),
      ixs
    );
    await expectTXTable(txEnvelope, "before", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;
  });

  it("Create Pool", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();
    [, , poolIdentifier] = await withCreatePool(
      transaction,
      provider.connection,
      provider.wallet,
      {
        overlayText: overlayText,
        allowedCollections: [web3.Keypair.generate().publicKey],
      }
    );

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );

    await expectTXTable(txEnvelope, "test", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [stakePoolId] = await findStakePoolId(poolIdentifier);
    const stakePoolData = await getStakePool(provider.connection, stakePoolId);

    expect(stakePoolData.parsed.identifier.toNumber()).to.eq(
      poolIdentifier.toNumber()
    );
  });

  it("Init stake entry for pool", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withCreateEntry(transaction, provider.connection, provider.wallet, {
      receiptMintKeypair: receiptMintKeypair,
      stakePoolIdentifier: poolIdentifier,
      originalMint: originalMint.publicKey,
      name: entryName,
      symbol: symbol,
    });

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions],
      [receiptMintKeypair]
    );

    expect(async () => {
      await expectTXTable(txEnvelope, "Fail init", {
        verbosity: "error",
        formatLogs: true,
      }).to.be.rejectedWith(Error);
    });
  });
});
