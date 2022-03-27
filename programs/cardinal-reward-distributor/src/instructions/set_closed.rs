use {
    crate::{state::*, errors::ErrorCode},
    anchor_lang::{prelude::*},
    cardinal_stake_pool::state::{StakePool}
};

#[derive(Accounts)]
pub struct SetClosedCtx<'info> {
    #[account(mut, constraint = reward_distributor.stake_pool == stake_pool.key())]
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut, constraint = signer.key() == stake_pool.authority @ErrorCode::InvalidAuthority)]
    signer: Signer<'info>,
}

pub fn handler(ctx: Context<SetClosedCtx>, closed: bool) -> Result<()> {
    ctx.accounts.reward_distributor.closed = closed;
    return Ok(())
}