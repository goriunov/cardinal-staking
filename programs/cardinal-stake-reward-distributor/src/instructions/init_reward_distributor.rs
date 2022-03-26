use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::Mint,
    cardinal_stake_pool::state::StakePool,
};

#[derive(Accounts)]
pub struct InitRewardDistributorCtx<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        space = REWARD_DISTRIBUTOR_SIZE,
        seeds = [REWARD_DISTRIBUTOR_SEED.as_bytes(), stake_pool.key().as_ref()],
        bump,
    )]
    reward_distributor: Box<Account<'info, RewardDistributor>>,

    stake_pool: Box<Account<'info, StakePool>>,

    reward_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitRewardDistributorCtx>, reward_amount: u64, reward_duration_seconds: u64) -> Result<()> {
    let reward_distributor = &mut ctx.accounts.reward_distributor;
    reward_distributor.bump = *ctx.bumps.get("reward_distributor").unwrap();
    reward_distributor.stake_pool = ctx.accounts.stake_pool.key();
    reward_distributor.reward_mint = ctx.accounts.reward_mint.key();
    reward_distributor.reward_amount = reward_amount;
    reward_distributor.reward_duration_seconds = reward_duration_seconds;

    // todo transfer mint authority of tokens
    // todo make instruction to take back mint authority?
    return Ok(());
}
