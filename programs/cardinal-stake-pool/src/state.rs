use anchor_lang::prelude::*;

pub const STAKE_ENTRY_PREFIX: &str = "stake-entry";
pub const STAKE_ENTRY_SIZE: usize = 8 + std::mem::size_of::<StakeEntry>() + 64;

pub const STAKE_POOL_PREFIX: &str = "stake-pool";
// max 4 pubkeys and 256 for strings
pub const STAKE_POOL_SIZE: usize = 8 + 1 + 8 + 32 * 4 + 256;

#[account]
pub struct StakeEntry {
    pub bump: u8,
    pub pool: Pubkey,
    pub original_mint: Pubkey,
    pub receipt_mint: Pubkey,
    pub total_stake_seconds: i64,
    pub last_staked_at: i64,
    pub last_staker: Pubkey,
    pub authority: Pubkey,
}

#[account]
pub struct StakePool {
    pub bump: u8,
    pub identifier: u64,
    pub allowed_creators: Vec<Pubkey>,
    pub allowed_collections: Vec<Pubkey>,
    pub overlay_text: String,
    pub image_uri: String,
}

// pub fn custom_seeds(ix: &'static InitEntryIx, pool_identifier: u64) -> &'static[u8]{
//     if ix.fungible{
//         return ix.wallet.as_ref()
//     } else {
//         return pool_identifier.to_le_bytes().as_ref()
//     }
// }
