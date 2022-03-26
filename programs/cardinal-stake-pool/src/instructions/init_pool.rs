use {crate::state::*, anchor_lang::prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitPoolIx {
    identifier: u64,
    overlay_text: String,
    image_uri: String,
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

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitPoolCtx>, ix: InitPoolIx) -> Result<()> {
    let stake_pool = &mut ctx.accounts.stake_pool;
    stake_pool.bump = *ctx.bumps.get("stake_pool").unwrap();
    stake_pool.identifier = ix.identifier;
    stake_pool.overlay_text = ix.overlay_text;
    stake_pool.image_uri = ix.image_uri;

    return Ok(());
}
