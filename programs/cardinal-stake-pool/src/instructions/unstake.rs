use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

use anchor_spl::token::{self, Token, TokenAccount};

use cardinal_token_manager::{self, program::CardinalTokenManager, state::TokenManager};

#[derive(Accounts)]
pub struct UnstakeCtx<'info> {
    #[account(mut)]
    stake_entry: Box<Account<'info, StakeEntry>>,
    #[account(mut)]
    token_manager: Box<Account<'info, TokenManager>>,

    // stake_entry token accounts
    #[account(mut, constraint =
        stake_entry_original_mint_token_account.amount > 0
        && stake_entry_original_mint_token_account.mint == stake_entry.original_mint
        && stake_entry_original_mint_token_account.owner == stake_entry.key()
        @ ErrorCode::InvalidStakeEntryOriginalMintTokenAccount)]
    stake_entry_original_mint_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint =
        stake_entry_receipt_mint_token_account.amount > 0
        && stake_entry_receipt_mint_token_account.mint == stake_entry.receipt_mint
        && stake_entry_receipt_mint_token_account.owner == stake_entry.key()
        @ ErrorCode::InvalidStakeEntryMintTokenAccount)]
    stake_entry_receipt_mint_token_account: Box<Account<'info, TokenAccount>>,

    // user
    #[account(mut, constraint = user.key() == stake_entry.last_staker @ ErrorCode::InvalidUnstakeUser)]
    user: Signer<'info>,
    #[account(mut, constraint =
        user_original_mint_token_account.amount == 0
        && user_original_mint_token_account.mint == stake_entry.original_mint
        && user_original_mint_token_account.owner == user.key()
        @ ErrorCode::InvalidUserOriginalMintTokenAccount)]
    user_original_mint_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, constraint =
        user_receipt_mint_token_account.amount == 0
        && user_receipt_mint_token_account.mint == stake_entry.receipt_mint
        && user_receipt_mint_token_account.owner == user.key()
        @ ErrorCode::InvalidUserMintTokenAccount)]
    user_receipt_mint_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    token_manager_mint_account: Box<Account<'info, TokenAccount>>,

    // programs
    token_program: Program<'info, Token>,
    token_manager_program: Program<'info, CardinalTokenManager>,
}

pub fn handler(ctx: Context<UnstakeCtx>) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    stake_entry.total_stake_seconds += Clock::get().unwrap().unix_timestamp - stake_entry.last_staked_at;
    stake_entry.last_staker = Pubkey::default();

    let stake_entry_seed = &[STAKE_ENTRY_PREFIX.as_bytes(), stake_entry.pool.as_ref(), stake_entry.original_mint.as_ref(), &[stake_entry.bump]];
    let stake_entry_signer = &[&stake_entry_seed[..]];

    // give back original mint to user
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.stake_entry_original_mint_token_account.to_account_info(),
        to: ctx.accounts.user_original_mint_token_account.to_account_info(),
        authority: stake_entry.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(stake_entry_signer);
    token::transfer(cpi_context, 1)?;

    Ok(())
}
