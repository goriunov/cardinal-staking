pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp");

#[program]
pub mod cardinal_stake_pool {
    use super::*;

    pub fn init_reward_distributor(ctx: Context<InitRewardDistributorCtx>, ix: InitRewardDistributorIx) -> Result<()> {
        init_reward_distributor::handler(ctx, ix)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewardsCtx>) -> Result<()> {
        claim_rewards::handler(ctx)
    }
}
