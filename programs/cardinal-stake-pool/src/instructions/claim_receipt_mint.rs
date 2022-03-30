use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount},
    cardinal_token_manager::{
        self,
        program::CardinalTokenManager,
        state::{InvalidationType, TokenManagerKind},
    },
};

#[derive(Accounts)]
pub struct ClaimReceiptMintCtx<'info> {
    #[account(mut)]
    stake_entry: Box<Account<'info, StakeEntry>>,

    #[account(mut, constraint = receipt_mint.key() == stake_entry.receipt_mint.unwrap() @ ErrorCode::InvalidTokenManagerMint)]
    receipt_mint: Box<Account<'info, Mint>>,

    #[account(mut, constraint =
        stake_entry_receipt_mint_token_account.amount > 0
        && stake_entry_receipt_mint_token_account.mint == stake_entry.receipt_mint.unwrap()
        && stake_entry_receipt_mint_token_account.owner == stake_entry.key()
        @ ErrorCode::InvalidStakeEntryMintTokenAccount)]
    stake_entry_receipt_mint_token_account: Box<Account<'info, TokenAccount>>,

    // user
    #[account(mut, constraint = user.key() == stake_entry.last_staker.unwrap() @ ErrorCode::InvalidLastStaker)]
    user: Signer<'info>,
    #[account(mut, constraint =
        user_receipt_mint_token_account.amount == 0
        && user_receipt_mint_token_account.mint == receipt_mint.key()
        && user_receipt_mint_token_account.owner == user.key()
        @ ErrorCode::InvalidUserMintTokenAccount)]
    user_receipt_mint_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    token_manager_mint_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    token_manager: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    mint_counter: UncheckedAccount<'info>,

    // programs
    token_program: Program<'info, Token>,
    token_manager_program: Program<'info, CardinalTokenManager>,
    system_program: Program<'info, System>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, ClaimReceiptMintCtx<'info>>) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    let stake_entry_seed = &[STAKE_ENTRY_PREFIX.as_bytes(), stake_entry.pool.as_ref(), stake_entry.original_mint.as_ref(), &[stake_entry.bump]];
    let stake_entry_signer = &[&stake_entry_seed[..]];

    // token manager init
    let cpi_accounts = cardinal_token_manager::cpi::accounts::InitCtx {
        token_manager: ctx.accounts.token_manager.to_account_info(),
        mint_counter: ctx.accounts.mint_counter.to_account_info(),
        issuer: stake_entry.to_account_info(),
        payer: ctx.accounts.user.to_account_info(),
        issuer_token_account: ctx.accounts.stake_entry_receipt_mint_token_account.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_manager_program.to_account_info(), cpi_accounts).with_signer(stake_entry_signer);
    cardinal_token_manager::cpi::init(cpi_ctx, ctx.accounts.receipt_mint.key(), 1)?;

    // add invalidator
    let cpi_accounts = cardinal_token_manager::cpi::accounts::AddInvalidatorCtx {
        token_manager: ctx.accounts.token_manager.to_account_info(),
        issuer: stake_entry.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_manager_program.to_account_info(), cpi_accounts).with_signer(stake_entry_signer);
    cardinal_token_manager::cpi::add_invalidator(cpi_ctx, ctx.accounts.user.key())?;

    // token manager issue
    let cpi_accounts = cardinal_token_manager::cpi::accounts::IssueCtx {
        token_manager: ctx.accounts.token_manager.to_account_info(),
        token_manager_token_account: ctx.accounts.token_manager_mint_account.to_account_info(),
        issuer: stake_entry.to_account_info(),
        issuer_token_account: ctx.accounts.stake_entry_receipt_mint_token_account.to_account_info(),
        payer: ctx.accounts.user.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    let issue_ix = cardinal_token_manager::instructions::IssueIx {
        amount: 1,
        kind: TokenManagerKind::Managed as u8,
        invalidation_type: InvalidationType::Return as u8,
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_manager_program.to_account_info(), cpi_accounts).with_signer(stake_entry_signer);
    cardinal_token_manager::cpi::issue(cpi_ctx, issue_ix)?;

    // token manager claim
    let cpi_accounts = cardinal_token_manager::cpi::accounts::ClaimCtx {
        token_manager: ctx.accounts.token_manager.to_account_info(),
        token_manager_token_account: ctx.accounts.token_manager_mint_account.to_account_info(),
        mint: ctx.accounts.receipt_mint.to_account_info(),
        recipient: ctx.accounts.user.to_account_info(),
        recipient_token_account: ctx.accounts.user_receipt_mint_token_account.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
    };
    let remaining_accounts = ctx.remaining_accounts.to_vec();
    let cpi_ctx = CpiContext::new(ctx.accounts.token_manager_program.to_account_info(), cpi_accounts).with_remaining_accounts(remaining_accounts);
    cardinal_token_manager::cpi::claim(cpi_ctx)?;
    Ok(())
}
