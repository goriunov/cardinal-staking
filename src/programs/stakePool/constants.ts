import type { AnchorTypes } from "@saberhq/anchor-contrib";
import { PublicKey } from "@solana/web3.js";

import * as STAKE_POOL_TYPES from "../../idl/cardinal_stake_pool";

export const STAKE_POOL_ADDRESS = new PublicKey(
  "t1LVbNwJZT3pxFQHfY65jp6QbvcTvda6oPSbaeKbYEs"
);

export const STAKE_POOL_SEED = "stake-pool";

export const STAKE_ENTRY_SEED = "stake-entry";

export const IDENTIFIER_SEED = "identifier";

export type STAKE_POOL_PROGRAM = STAKE_POOL_TYPES.CardinalStakePool;

export const STAKE_POOL_IDL = STAKE_POOL_TYPES.IDL;

export type StakePoolTypes = AnchorTypes<STAKE_POOL_PROGRAM>;

type Accounts = StakePoolTypes["Accounts"];
export type StakePoolData = Accounts["stakePool"];
export type StakeEntryData = Accounts["stakeEntry"];
export type IdentifierData = Accounts["identifier"];
