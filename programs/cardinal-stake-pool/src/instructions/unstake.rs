use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Token, TokenAccount},
};

#[derive(Accounts)]
pub struct UnstakeCtx<'info> {
    #[account(mut)]
    stake_pool: Box<Account<'info, StakePool>>,
    #[account(mut, constraint = stake_entry.pool == stake_pool.key())]
    stake_entry: Box<Account<'info, StakeEntry>>,

    // stake_entry token accounts
    #[account(mut, constraint =
        stake_entry_original_mint_token_account.amount > 0
        && stake_entry_original_mint_token_account.mint == stake_entry.original_mint
        && stake_entry_original_mint_token_account.owner == stake_entry.key()
        @ ErrorCode::InvalidStakeEntryOriginalMintTokenAccount)]
    stake_entry_original_mint_token_account: Box<Account<'info, TokenAccount>>,

    // user
    #[account(mut, constraint = user.key() == stake_entry.last_staker @ ErrorCode::InvalidUnstakeUser)]
    user: Signer<'info>,
    #[account(mut, constraint =
        user_original_mint_token_account.mint == stake_entry.original_mint
        && user_original_mint_token_account.owner == user.key()
        @ ErrorCode::InvalidUserOriginalMintTokenAccount)]
    user_original_mint_token_account: Box<Account<'info, TokenAccount>>,

    // programs
    token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<UnstakeCtx>) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;

    let original_mint = stake_entry.original_mint;
    let user = ctx.accounts.user.key();
    let stake_pool = stake_entry.pool;

    let stake_entry_seed = [STAKE_ENTRY_PREFIX.as_bytes(), stake_pool.as_ref(), original_mint.as_ref(), user.as_ref(), &[stake_entry.bump]];
    let stake_entry_signer = &[&stake_entry_seed[..]];

    // If receipt has been minted, ensure it is back in the stake_entry
    if stake_entry.stake_mint != None {
        let remaining_accs = &mut ctx.remaining_accounts.iter();
        let stake_entry_receipt_mint_token_account_info = next_account_info(remaining_accs)?;
        let stake_entry_receipt_mint_token_account = Account::<TokenAccount>::try_from(stake_entry_receipt_mint_token_account_info)?;
        if stake_entry_receipt_mint_token_account.mint != stake_entry.stake_mint.unwrap()
            || stake_entry_receipt_mint_token_account.owner != stake_entry.key()
            || stake_entry_receipt_mint_token_account.amount == 0
        {
            return Err(error!(ErrorCode::InvalidStakeEntryStakeTokenAccount));
        }
    }

    // give back original mint to user
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.stake_entry_original_mint_token_account.to_account_info(),
        to: ctx.accounts.user_original_mint_token_account.to_account_info(),
        authority: stake_entry.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(stake_entry_signer);
    token::transfer(cpi_context, stake_entry.amount)?;

    stake_entry.total_stake_seconds = (stake_entry
        .total_stake_seconds
        .saturating_add(Clock::get().unwrap().unix_timestamp.checked_sub(stake_entry.last_staked_at).unwrap().into()))
    .checked_mul(stake_entry.amount.try_into().unwrap())
    .unwrap();
    stake_entry.last_staker = Pubkey::default();
    stake_entry.original_mint_claimed = false;
    stake_entry.stake_mint_claimed = false;
    stake_entry.amount = 0;
    if ctx.accounts.stake_pool.reset_on_unstake {
        stake_entry.total_stake_seconds = 0;
    }

    Ok(())
}
