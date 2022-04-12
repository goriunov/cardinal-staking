import { withWrapSol } from "@cardinal/token-manager/dist/cjs/wrappedSol";
import { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import type * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { expect } from "chai";

import { createStakePool } from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";
import { getRewardDistributor } from "../src/programs/rewardDistributor/accounts";
import { findRewardDistributorId } from "../src/programs/rewardDistributor/pda";
import { withInitRewardDistributor } from "../src/programs/rewardDistributor/transaction";
import { createMasterEditionIxs, createMint } from "./utils";
import { getProvider } from "./workspace";

describe("Stake and claim rewards from treasury", () => {
  const maxSupply = 100;

  let stakePoolId: web3.PublicKey;
  let originalMint: splToken.Token;
  const rewardMint = new web3.PublicKey(
    "So11111111111111111111111111111111111111112"
  );
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

    const fromAirdropSignature = await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(fromAirdropSignature);

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

    let transaction: web3.Transaction;
    [transaction, stakePoolId] = await createStakePool(
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
  });

  it("Create Reward Distributor", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withWrapSol(
      transaction,
      provider.connection,
      provider.wallet,
      maxSupply
    );

    await withInitRewardDistributor(
      transaction,
      provider.connection,
      provider.wallet,
      {
        stakePoolId: stakePoolId,
        rewardMintId: rewardMint,
        kind: RewardDistributorKind.Treasury,
        maxSupply: new BN(maxSupply),
      }
    );

    const txEnvelope = new TransactionEnvelope(SolanaProvider.init(provider), [
      ...transaction.instructions,
    ]);

    await expectTXTable(
      txEnvelope,
      "Create reward distributor and reward entry",
      {
        verbosity: "error",
        formatLogs: true,
      }
    ).to.be.fulfilled;

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const rewardDistributorData = await getRewardDistributor(
      provider.connection,
      rewardDistributorId
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.toString()
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.toString()
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.toString()
    );
  });
});
