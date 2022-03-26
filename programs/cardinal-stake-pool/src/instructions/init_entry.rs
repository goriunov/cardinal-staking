use {
    crate::state::*,
    anchor_lang::{
        prelude::*,
        solana_program::program::{invoke, invoke_signed},
    },
    anchor_spl::{
        associated_token::{self, AssociatedToken},
        token::{self, Mint, Token},
    },
    cardinal_token_manager::{self, program::CardinalTokenManager},
    mpl_token_metadata::{self, instruction::create_metadata_accounts_v2},
    solana_program::{program_pack::Pack, system_instruction::create_account},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitEntryIx {
    name: String,
    symbol: String,
    text_overlay: String,
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

    #[account(mut)]
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
    let stake_pool = &mut ctx.accounts.stake_pool;
    stake_entry.bump = *ctx.bumps.get("stake_entry").unwrap();
    stake_entry.pool = stake_pool.key();
    stake_entry.original_mint = ctx.accounts.original_mint.key();
    stake_entry.receipt_mint = ctx.accounts.receipt_mint.key();

    let stake_entry_seed = &[STAKE_ENTRY_PREFIX.as_bytes(), stake_entry.pool.as_ref(), stake_entry.original_mint.as_ref(), &[stake_entry.bump]];
    let stake_entry_signer = &[&stake_entry_seed[..]];

    // create mint
    invoke(
        &create_account(
            ctx.accounts.payer.key,
            ctx.accounts.receipt_mint.key,
            ctx.accounts.rent.minimum_balance(spl_token::state::Mint::LEN),
            spl_token::state::Mint::LEN as u64,
            &spl_token::id(),
        ),
        &[ctx.accounts.payer.to_account_info(), ctx.accounts.receipt_mint.to_account_info()],
    )?;

    // Initialize mint
    let cpi_accounts = token::InitializeMint {
        mint: ctx.accounts.receipt_mint.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::initialize_mint(cpi_context, 0, &stake_entry.key(), Some(&stake_entry.key()))?;

    // create associated token account for stake_entry
    let cpi_accounts = associated_token::Create {
        payer: ctx.accounts.payer.to_account_info(),
        associated_token: ctx.accounts.stake_entry_receipt_mint_token_account.to_account_info(),
        authority: stake_entry.to_account_info(),
        mint: ctx.accounts.receipt_mint.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    associated_token::create(cpi_context)?;

    // create metadata
    invoke_signed(
        &create_metadata_accounts_v2(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.receipt_mint_metadata.key,
            *ctx.accounts.receipt_mint.key,
            stake_entry.key(),
            *ctx.accounts.payer.key,
            stake_entry.key(),
            ix.name,
            ix.symbol,
            // generative URL which will include image of the name with expiration data
            "https://api.cardinal.so/metadata/".to_string() + &ctx.accounts.receipt_mint.key().to_string() + &"?text=".to_string() + &ix.text_overlay,
            None,
            1,
            true,
            true,
            None,
            None,
        ),
        &[
            ctx.accounts.receipt_mint_metadata.to_account_info(),
            ctx.accounts.receipt_mint.to_account_info(),
            stake_entry.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            stake_entry.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        stake_entry_signer,
    )?;

    // mint single token to token manager mint token account
    let cpi_accounts = token::MintTo {
        mint: ctx.accounts.receipt_mint.to_account_info(),
        to: ctx.accounts.stake_entry_receipt_mint_token_account.to_account_info(),
        authority: stake_entry.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(stake_entry_signer);
    token::mint_to(cpi_context, 1)?;

    // init token  manager
    let token_manager_program = ctx.accounts.token_manager_program.to_account_info();
    let cpi_accounts = cardinal_token_manager::cpi::accounts::CreateMintManagerCtx {
        mint_manager: ctx.accounts.mint_manager.to_account_info(),
        mint: ctx.accounts.receipt_mint.to_account_info(),
        freeze_authority: stake_entry.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(token_manager_program, cpi_accounts).with_signer(stake_entry_signer);
    cardinal_token_manager::cpi::create_mint_manager(cpi_ctx)?;

    return Ok(());
}
