use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, Token, TokenAccount},
    cardinal_token_manager::{
        self,
        program::CardinalTokenManager,
        state::{InvalidationType, TokenManagerKind},
    },
};

#[derive(Accounts)]
pub struct StakeCtx<'info> {
    #[account(mut)]
    stake_entry: Box<Account<'info, StakeEntry>>,

    #[account(constraint = original_mint.key() == stake_entry.original_mint @ ErrorCode::InvalidOriginalMint)]
    original_mint: Box<Account<'info, Mint>>,

    // stake_entry token accounts
    #[account(mut, constraint =
        stake_entry_original_mint_token_account.amount == 0
        && stake_entry_original_mint_token_account.mint == stake_entry.original_mint
        && stake_entry_original_mint_token_account.owner == stake_entry.key()
        @ ErrorCode::InvalidStakeEntryOriginalMintTokenAccount)]
    stake_entry_original_mint_token_account: Box<Account<'info, TokenAccount>>,

    // user
    #[account(mut)]
    user: Signer<'info>,
    #[account(mut, constraint =
        user_original_mint_token_account.amount > 0
        && user_original_mint_token_account.mint == original_mint.key()
        && user_original_mint_token_account.owner == user.key()
        @ ErrorCode::InvalidUserOriginalMintTokenAccount)]
    user_original_mint_token_account: Box<Account<'info, TokenAccount>>,

    // programs
    token_program: Program<'info, Token>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, StakeCtx<'info>>, stake_type: u8) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;

    match stake_type {
        k if k == StakeType::Locked as u8 => {
            // get stake entry signer
            let stake_entry_seed = &[STAKE_ENTRY_PREFIX.as_bytes(), stake_entry.pool.as_ref(), stake_entry.original_mint.as_ref(), &[stake_entry.bump]];
            let stake_entry_signer = &[&stake_entry_seed[..]];

            // Pull remaining accounts needed for LOCK
            let remaining_accs = &mut ctx.remaining_accounts.iter();
            let token_manager_program = next_account_info(remaining_accs)?;
            if token_manager_program.key() != CardinalTokenManager::id() {
                return Err(error!(ErrorCode::InvalidTokenManagerProgram));
            }
            let token_manager_account_info = next_account_info(remaining_accs)?;
            let token_manager_original_mint_token_account_info = next_account_info(remaining_accs)?;
            let mint_counter_account_info = next_account_info(remaining_accs)?;
            let system_program = next_account_info(remaining_accs)?;

            // transfer original
            let cpi_accounts = token::Transfer {
                from: ctx.accounts.user_original_mint_token_account.to_account_info(),
                to: ctx.accounts.stake_entry_original_mint_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_context, 1)?;

            // token manager init
            let cpi_accounts = cardinal_token_manager::cpi::accounts::InitCtx {
                token_manager: token_manager_account_info.to_account_info(),
                mint_counter: mint_counter_account_info.to_account_info(),
                issuer: stake_entry.to_account_info(),
                payer: ctx.accounts.user.to_account_info(),
                issuer_token_account: ctx.accounts.stake_entry_original_mint_token_account.to_account_info(),
                system_program: system_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(token_manager_program.to_account_info(), cpi_accounts).with_signer(stake_entry_signer);
            cardinal_token_manager::cpi::init(cpi_ctx, ctx.accounts.original_mint.key(), 1)?;

            // add invalidator
            let cpi_accounts = cardinal_token_manager::cpi::accounts::AddInvalidatorCtx {
                token_manager: token_manager_account_info.to_account_info(),
                issuer: stake_entry.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(token_manager_program.to_account_info(), cpi_accounts).with_signer(stake_entry_signer);
            cardinal_token_manager::cpi::add_invalidator(cpi_ctx, stake_entry.key())?;

            // token manager issue
            let cpi_accounts = cardinal_token_manager::cpi::accounts::IssueCtx {
                token_manager: token_manager_account_info.to_account_info(),
                token_manager_token_account: token_manager_original_mint_token_account_info.to_account_info(),
                issuer: stake_entry.to_account_info(),
                issuer_token_account: ctx.accounts.stake_entry_original_mint_token_account.to_account_info(),
                payer: ctx.accounts.user.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: system_program.to_account_info(),
            };
            let issue_ix = cardinal_token_manager::instructions::IssueIx {
                amount: 1,
                kind: TokenManagerKind::Edition as u8,
                invalidation_type: InvalidationType::Return as u8,
            };
            let cpi_ctx = CpiContext::new(token_manager_program.to_account_info(), cpi_accounts).with_signer(stake_entry_signer);
            cardinal_token_manager::cpi::issue(cpi_ctx, issue_ix)?;

            // token manager claim
            let cpi_accounts = cardinal_token_manager::cpi::accounts::ClaimCtx {
                token_manager: token_manager_account_info.to_account_info(),
                token_manager_token_account: token_manager_original_mint_token_account_info.to_account_info(),
                mint: ctx.accounts.original_mint.to_account_info(),
                recipient: ctx.accounts.user.to_account_info(),
                recipient_token_account: ctx.accounts.user_original_mint_token_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(token_manager_program.to_account_info(), cpi_accounts).with_remaining_accounts(remaining_accs.cloned().collect::<Vec<AccountInfo<'info>>>());
            cardinal_token_manager::cpi::claim(cpi_ctx)?;
        }
        k if k == StakeType::Escrow as u8 => {
            // transfer original
            let cpi_accounts = token::Transfer {
                from: ctx.accounts.user_original_mint_token_account.to_account_info(),
                to: ctx.accounts.stake_entry_original_mint_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_context, 1)?;
        }
        _ => return Err(error!(ErrorCode::InvalidStakeType)),
    }

    // update stake entry
    stake_entry.last_staked_at = Clock::get().unwrap().unix_timestamp;
    stake_entry.last_staker = ctx.accounts.user.key();
    stake_entry.stake_type = stake_type;
    Ok(())
}
