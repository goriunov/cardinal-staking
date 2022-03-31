pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp");

#[program]
pub mod cardinal_reward_distributor {
    use super::*;

    pub fn init_reward_distributor<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, InitRewardDistributorCtx<'info>>, ix: InitRewardDistributorIx) -> Result<()> {
        init_reward_distributor::handler(ctx, ix)
    }

    pub fn init_reward_entry(ctx: Context<InitRewardEntryCtx>, ix: InitRewardEntryIx) -> Result<()> {
        init_reward_entry::handler(ctx, ix)
    }

    pub fn claim_rewards<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, ClaimRewardsCtx<'info>>) -> Result<()> {
        claim_rewards::handler(ctx)
    }

    pub fn reopen(ctx: Context<ReopenCtx>) -> Result<()> {
        reopen::handler(ctx)
    }

    pub fn close(ctx: Context<CloseCtx>) -> Result<()> {
        close::handler(ctx)
    }
}
