use {crate::state::*, anchor_lang::prelude::*};

#[derive(Accounts)]
pub struct UpdateTotalStakeSecondsCtx<'info> {
    stake_entry: Account<'info, StakeEntry>,

    #[account(mut, constraint = stake_entry.last_staker == last_staker.key())]
    last_staker: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateTotalStakeSecondsCtx>) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    stake_entry.total_stake_seconds = (stake_entry
        .total_stake_seconds
        .saturating_add(Clock::get().unwrap().unix_timestamp.checked_sub(stake_entry.last_staked_at).unwrap() as u128))
    .checked_mul(stake_entry.amount.try_into().unwrap())
    .unwrap();
    stake_entry.last_staked_at = Clock::get().unwrap().unix_timestamp;

    Ok(())
}
