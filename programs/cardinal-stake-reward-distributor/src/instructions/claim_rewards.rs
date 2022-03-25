use {
    crate::{state::*, errors::ErrorCode},
    anchor_lang::{prelude::*},
    anchor_spl::{token::{Token, TokenAccount}},
    cardinal_stake_pool::{state::{StakeEntry, StakePool}}
};

#[derive(Accounts)]
#[instruction(mint: Pubkey)]
pub struct ClaimRewardsCtx<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = REWARD_ENTRY_SIZE,
        // TODO i think this makes more sense as the reward distributor but it could be the pool
        seeds = [REWARD_ENTRY_SEED.as_bytes(), reward_distributor.key().as_ref(), mint.as_ref()],
        bump,
    )]
    reward_entry: Box<Account<'info, RewardEntry>>,
    #[account(constraint = reward_distributor.stake_pool == stake_pool.key())]
    reward_distributor: Box<Account<'info, RewardDistributor>>,

    #[account(constraint = stake_entry.mint == mint)]
    stake_entry: Box<Account<'info, StakeEntry>>,
    #[account(constraint = stake_pool.key() == stake_entry.pool)]
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut, constraint =
        token_account.amount == 1
        && token_account.mint == mint
        && token_account.owner == user.key()
        @ ErrorCode::InvalidTokenAccount)]
    token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    user: Signer<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimRewardsCtx>) -> Result<()> {
    let reward_entry = &mut ctx.accounts.reward_entry;
    reward_entry.bump = *ctx.bumps.get("reward_entry").unwrap();
    let rewards_distributed = reward_entry.rewards_distributed;

    let reward_amount = ctx.accounts.reward_distributor.reward_amount;
    let reward_duration_seconds = ctx.accounts.reward_distributor.reward_duration_seconds;

    let reward_time_received = rewards_distributed / reward_amount * reward_duration_seconds;
    if reward_time_received <= ctx.accounts.stake_entry.total_stake_seconds as u64 {
        // mint to the user = reward_time_received / reward_duration_seconds * reward_amount
    }
    return Ok(())
}