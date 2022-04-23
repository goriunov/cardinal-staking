use {crate::state::*, anchor_lang::prelude::*, anchor_spl::token::TokenAccount};

#[derive(Accounts)]
pub struct UpdateTotalStakeSecondsCtx<'info> {
    #[account(mut)]
    stake_entry: Account<'info, StakeEntry>,

    #[account(mut, constraint = user_receipt_mint_token_account.amount > 0
        && ((stake_entry.stake_mint_claimed && user_receipt_mint_token_account.mint == stake_entry.stake_mint.unwrap()) || (stake_entry.original_mint_claimed && user_receipt_mint_token_account.mint == stake_entry.original_mint))
        && user_receipt_mint_token_account.owner == stake_entry.key())]
    user_receipt_mint_token_account: Box<Account<'info, TokenAccount>>,

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
