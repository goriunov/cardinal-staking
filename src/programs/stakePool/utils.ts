import { BN, Program, Provider } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";

import type { STAKE_POOL_PROGRAM } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import type { IdentifierData } from "./constants";
import { findIdentifierId } from "./pda";

export const getNextPoolIdentifier = async (
  connection: Connection
): Promise<BN> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  try {
    const [identifierId] = await findIdentifierId();
    const parsed = (await stakePoolProgram.account.identifier.fetch(
      identifierId
    )) as IdentifierData;
    return parsed.count.add(new BN(1));
  } catch (e) {
    return new BN(1);
  }
};
