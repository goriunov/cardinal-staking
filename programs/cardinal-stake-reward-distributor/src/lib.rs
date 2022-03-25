pub mod instructions;
pub mod state;
pub mod errors;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp");

#[program]
pub mod cardinal_stake_pool {
    use super::*;

    pub fn init_reward_distributor(ctx: Context<InitRewardDistributorCtx>, reward_amount: u64, reward_duration_seconds: u64) -> Result<()> {
        init_reward_distributor::handler(ctx, reward_amount, reward_duration_seconds)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewardsCtx>) -> Result<()> {
        claim_rewards::handler(ctx)
    }
}