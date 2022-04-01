use anchor_lang::prelude::*;
use std::str::FromStr;

pub const STAKE_ENTRY_PREFIX: &str = "stake-entry";
pub const STAKE_ENTRY_SIZE: usize = 8 + std::mem::size_of::<StakeEntry>() + 8;

pub const STAKE_POOL_PREFIX: &str = "stake-pool";
pub const STAKE_POOL_SIZE: usize = 8 + 1 + 8 + 32 * 5 + 256;

pub const IDENTIFIER_PREFIX: &str = "identifier";
pub const IDENTIFIER_SIZE: usize = 8 + std::mem::size_of::<Identifier>() + 8;

#[account]
pub struct StakeEntry {
    pub bump: u8,
    pub pool: Pubkey,
    pub original_mint: Pubkey,
    pub original_mint_claimed: bool,
    pub last_staker: Pubkey,
    pub last_staked_at: i64,
    pub total_stake_seconds: i64,
    pub stake_mint_claimed: bool,
    pub stake_mint: Option<Pubkey>,
}

#[account]
pub struct StakePool {
    pub bump: u8,
    pub identifier: u64,
    pub allowed_creators: Vec<Pubkey>,
    pub allowed_collections: Vec<Pubkey>,
    pub authority: Pubkey,
    pub overlay_text: String,
    pub image_uri: String,
}

#[account]
pub struct Identifier {
    pub bump: u8,
    pub count: u64,
}

pub fn is_authority(key: &Pubkey) -> bool {
    *key == Pubkey::from_str("crdk1Mw5WzoVNgz8RgHJXzHdwSrJvp4UcGirvtJzB6U").unwrap()
}
