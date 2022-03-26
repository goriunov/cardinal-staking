pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("t1LVbNwJZT3pxFQHfY65jp6QbvcTvda6oPSbaeKbYEs");

#[program]
pub mod cardinal_stake_pool {
    use super::*;

    pub fn init_pool(ctx: Context<InitPoolCtx>, ix: InitPoolIx) -> Result<()> {
        init_pool::handler(ctx, ix)
    }

    pub fn init_entry(ctx: Context<InitEntryCtx>, ix: InitEntryIx) -> Result<()> {
        init_entry::handler(ctx, ix)
    }

    pub fn stake<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, StakeCtx<'info>>) -> Result<()> {
        stake::handler(ctx)
    }
    pub fn unstake(ctx: Context<UnstakeCtx>) -> Result<()> {
        unstake::handler(ctx)
    }
}
