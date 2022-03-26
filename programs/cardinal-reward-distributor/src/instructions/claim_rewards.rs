use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, Token, TokenAccount},
    cardinal_stake_pool::state::{StakeEntry, StakePool},
};

#[derive(Accounts)]
pub struct ClaimRewardsCtx<'info> {
    #[account(mut)]
    reward_entry: Box<Account<'info, RewardEntry>>,
    #[account(constraint = reward_distributor.stake_pool == stake_pool.key())]
    reward_distributor: Box<Account<'info, RewardDistributor>>,

    #[account(constraint = stake_entry.original_mint == reward_entry.mint)]
    stake_entry: Box<Account<'info, StakeEntry>>,
    #[account(constraint = stake_pool.key() == stake_entry.pool)]
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut, constraint =
        mint_token_account.amount == 1
        && mint_token_account.mint == reward_entry.mint
        && mint_token_account.owner == user.key()
        @ ErrorCode::InvalidTokenAccount)]
    mint_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = reward_mint.key() == reward_distributor.reward_mint @ ErrorCode::InvalidRewardMint)]
    reward_mint: Box<Account<'info, Mint>>,

    #[account(mut, constraint = user_reward_mint_token_account.owner == user.key() @ ErrorCode::InvalidUserRewardMintTokenAccount)]
    user_reward_mint_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    user: Signer<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimRewardsCtx>) -> Result<()> {
    let reward_entry = &mut ctx.accounts.reward_entry;
    reward_entry.bump = *ctx.bumps.get("reward_entry").unwrap();
    let rewards_distributed = reward_entry.rewards_distributed;

    let reward_distributor = &mut ctx.accounts.reward_distributor;
    let reward_distributor_seed = &[REWARD_DISTRIBUTOR_SEED.as_bytes(), reward_distributor.stake_pool.as_ref(), &[reward_distributor.bump]];
    let stake_pool_signer = &[&reward_distributor_seed[..]];

    let reward_amount = reward_distributor.reward_amount;
    let reward_duration_seconds = reward_distributor.reward_duration_seconds;
    let max_supply = reward_distributor.max_supply;

    let reward_time_received = rewards_distributed / reward_amount * reward_duration_seconds;
    if reward_time_received <= ctx.accounts.stake_entry.total_stake_seconds as u64 && (max_supply == None || reward_distributor.rewards_issued < max_supply.unwrap()) {
        // mint to the user = reward_time_received / reward_duration_seconds * reward_amount
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.reward_mint.to_account_info(),
            to: ctx.accounts.user_reward_mint_token_account.to_account_info(),
            authority: ctx.accounts.stake_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(stake_pool_signer);
        token::mint_to(cpi_context, reward_distributor.reward_amount)?;

        reward_distributor.rewards_issued += reward_distributor.reward_amount;
        if reward_distributor.max_supply != None && reward_distributor.rewards_issued == reward_distributor.max_supply.unwrap() {
            reward_distributor.closed = true;
        }
    }
    Ok(())
}
