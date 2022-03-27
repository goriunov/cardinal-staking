use {
    crate::{state::*, errors::ErrorCode},
    anchor_lang::{prelude::*,
}};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitPoolIx {
    identifier: u64,
    allowed_collections: Vec<Pubkey>,
    allowed_creators: Vec<Pubkey>,
    overlay_text: String,
    image_uri: String,
    authority: Pubkey,
}

#[derive(Accounts)]
#[instruction(ix: InitPoolIx)]
pub struct InitPoolCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = STAKE_POOL_SIZE,
        seeds = [STAKE_POOL_PREFIX.as_bytes(), ix.identifier.to_le_bytes().as_ref()],
        bump
    )]
    stake_pool: Account<'info, StakePool>,

    #[account(mut, constraint = is_admin(&payer.key()) @ ErrorCode::InvalidPoolAuthority)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitPoolCtx>, ix: InitPoolIx) -> Result<()> {
    let stake_pool = &mut ctx.accounts.stake_pool;
    stake_pool.bump = *ctx.bumps.get("stake_pool").unwrap();
    stake_pool.identifier = ix.identifier;
    stake_pool.allowed_collections = ix.allowed_collections;
    stake_pool.allowed_creators = ix.allowed_creators;
    stake_pool.overlay_text = ix.overlay_text;
    stake_pool.image_uri = ix.image_uri;
    stake_pool.authority = ix.authority;

    Ok(())
}
