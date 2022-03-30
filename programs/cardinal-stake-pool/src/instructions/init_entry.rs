use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::{
        prelude::*,
        solana_program::program::{invoke, invoke_signed},
    },
    anchor_spl::{
        associated_token::{self, AssociatedToken},
        token::{self, Mint, Token},
    },
    cardinal_token_manager::{self, program::CardinalTokenManager},
    mpl_token_metadata::state::{Creator, Metadata},
    mpl_token_metadata::{self, instruction::create_metadata_accounts_v2},
    solana_program::{program_pack::Pack, system_instruction::create_account},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitEntryIx {
    name: String,
    symbol: String,
}

#[derive(Accounts)]
#[instruction(ix: InitEntryIx)]
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
    #[account(mut)]
    receipt_mint: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    mint_manager: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    stake_entry_receipt_mint_token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    receipt_mint_metadata: UncheckedAccount<'info>,

    #[account(mut, constraint = payer.key() == stake_pool.authority)]
    payer: Signer<'info>,
    rent: Sysvar<'info, Rent>,
    token_program: Program<'info, Token>,
    token_manager_program: Program<'info, CardinalTokenManager>,
    associated_token: Program<'info, AssociatedToken>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitEntryCtx>, ix: InitEntryIx) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    let stake_pool = &ctx.accounts.stake_pool;
    stake_entry.bump = *ctx.bumps.get("stake_entry").unwrap();
    stake_entry.pool = ctx.accounts.stake_pool.key();
    stake_entry.original_mint = ctx.accounts.original_mint.key();

    let stake_pool_identifier = ctx.accounts.stake_pool.identifier.to_le_bytes();
    let stake_pool_seeds = &[STAKE_POOL_PREFIX.as_bytes(), stake_pool_identifier.as_ref(), &[ctx.accounts.stake_pool.bump]];
    let stake_pool_signer = &[&stake_pool_seeds[..]];

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
