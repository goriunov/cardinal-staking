use {anchor_lang::prelude::*};

pub const STAKE_ENTRY_PREFIX: &str = "stake-entry";
pub const STAKE_ENTRY_SIZE: usize = 8 + std::mem::size_of::<StakeEntry>() + 8;

pub const STAKE_POOL_PREFIX: &str = "stake-pool";
pub const STAKE_POOL_SIZE: usize = 8 + std::mem::size_of::<StakePool>() + 8;

#[account]
pub struct StakeEntry {
    pub bump: u8,
    pub token_manager: Pubkey,
    pub original_mint: Pubkey,
    pub mint: Pubkey,
    pub total_stake_seconds: i64,
    pub last_staked_at: i64,
    pub last_staker: Pubkey,
    pub authority: Pubkey,
}

#[account]
pub struct StakePool {
    pub bump: u8,
    pub identifier: u64,
}

// pub fn custom_seeds(ix: &'static InitEntryIx, pool_identifier: u64) -> &'static[u8]{
//     if ix.fungible{
//         return ix.wallet.as_ref()
//     } else {
//         return pool_identifier.to_le_bytes().as_ref()
//     }
// }