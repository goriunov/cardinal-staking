use {anchor_lang::prelude::*};

pub const REWARD_ENTRY_SEED: &str = "reward-entry";
pub const REWARD_ENTRY_SIZE: usize = 8 + std::mem::size_of::<RewardEntry>() + 8;
#[account]
pub struct RewardEntry {
    pub bump: u8,
    pub reward_distributor: Pubkey,
    pub mint: Pubkey,
    pub rewards_distributed: u64,
    pub multiplier: u64,
}

pub const REWARD_DISTRIBUTOR_SEED: &str = "reward-distributor";
pub const REWARD_DISTRIBUTOR_SIZE: usize = 8 + std::mem::size_of::<RewardDistributor>() + 8;
#[account]
pub struct RewardDistributor {
    pub bump: u8,
    pub stake_pool: Pubkey,
    pub reward_mint: Pubkey,
    pub reward_amount: u64,
    pub reward_duration_seconds: u64,
}
