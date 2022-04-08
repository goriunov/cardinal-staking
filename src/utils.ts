import type { web3 } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import type {
  ConfirmOptions,
  Connection,
  Signer,
  Transaction,
} from "@solana/web3.js";
import { sendAndConfirmRawTransaction } from "@solana/web3.js";

export const executeTransaction = async (
  connection: Connection,
  wallet: Wallet,
  transaction: Transaction,
  config: {
    silent?: boolean;
    signers?: Signer[];
    confirmOptions?: ConfirmOptions;
    callback?: (success: boolean) => void;
  }
): Promise<string> => {
  let txid = "";
  try {
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash("max")
    ).blockhash;
    await wallet.signTransaction(transaction);
    if (config.signers && config.signers.length > 0) {
      transaction.partialSign(...config.signers);
    }
    txid = await sendAndConfirmRawTransaction(
      connection,
      transaction.serialize(),
      config.confirmOptions
    );
    config.callback && config.callback(true);
    console.log("Successful tx", txid);
  } catch (e: unknown) {
    console.log("Failed transaction: ", e);
    config.callback && config.callback(false);
    if (!config.silent) {
      throw new Error(`${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return txid;
};

/**
 * Get total supply of mint
 * @param connection
 * @param originalMintId
 * @returns
 */
export const getMintSupply = async (
  connection: web3.Connection,
  originalMintId: web3.PublicKey
): Promise<number> => {
  const mint = new splToken.Token(
    connection,
    originalMintId,
    splToken.TOKEN_PROGRAM_ID,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    null
  );
  return (await mint.getMintInfo()).supply.toNumber();
};
