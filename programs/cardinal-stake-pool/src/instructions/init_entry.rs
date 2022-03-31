use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::Mint,
    mpl_token_metadata::state::Metadata,
    mpl_token_metadata::{self},
};
#[derive(Accounts)]
pub struct InitEntryCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = STAKE_ENTRY_SIZE,
        seeds = [STAKE_ENTRY_PREFIX.as_bytes(), stake_pool.key().as_ref(), original_mint.key().as_ref()],
        bump,
    )]
    stake_entry: Box<Account<'info, StakeEntry>>,
    #[account(mut)]
    stake_pool: Box<Account<'info, StakePool>>,

    original_mint: Box<Account<'info, Mint>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    original_mint_metadata: AccountInfo<'info>,

    #[account(mut, constraint = payer.key() == stake_pool.authority)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitEntryCtx>) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    let stake_pool = &ctx.accounts.stake_pool;
    stake_entry.bump = *ctx.bumps.get("stake_entry").unwrap();
    stake_entry.pool = ctx.accounts.stake_pool.key();
    stake_entry.original_mint = ctx.accounts.original_mint.key();

    // check allowlist
    if !stake_pool.allowed_creators.is_empty() || !stake_pool.allowed_collections.is_empty() {
        if ctx.accounts.original_mint_metadata.data_is_empty() {
            return Err(error!(ErrorCode::NoMintMetadata));
        }
        let original_mint_metadata = Metadata::from_account_info(&ctx.accounts.original_mint_metadata.to_account_info())?;
        let mut allowed = false;
        if !stake_pool.allowed_creators.is_empty() && original_mint_metadata.data.creators != None {
            let creators = original_mint_metadata.data.creators.unwrap();
            let find = creators.iter().find(|c| stake_pool.allowed_creators.contains(&c.address));
            if find != None {
                allowed = true
            };
        }
        if !stake_pool.allowed_collections.is_empty() && original_mint_metadata.collection != None && stake_pool.allowed_collections.contains(&original_mint_metadata.collection.unwrap().key) {
            allowed = true
        }
        if !allowed {
            return Err(error!(ErrorCode::MintNotAllowedInPool));
        }
    }
    Ok(())
}
