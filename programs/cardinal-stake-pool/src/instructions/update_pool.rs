use {crate::state::*, anchor_lang::prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdatePoolIx {
    overlay_text: Option<String>,
    image_uri: Option<String>,
    requires_collections: Option<Vec<Pubkey>>,
    requires_creators: Option<Vec<Pubkey>>,
    requires_authorization: Option<bool>,
    authority: Option<Pubkey>,
    reset_on_stake: Option<bool>,
}

#[derive(Accounts)]
#[instruction(ix: UpdatePoolIx)]
pub struct UpdatePoolCtx<'info> {
    #[account(mut, constraint = stake_pool.authority == payer.key())]
    stake_pool: Account<'info, StakePool>,

    #[account(mut)]
    payer: Signer<'info>,
}

pub fn handler(ctx: Context<UpdatePoolCtx>, ix: UpdatePoolIx) -> Result<()> {
    let stake_pool = &mut ctx.accounts.stake_pool;
    stake_pool.requires_collections = ix.requires_collections.unwrap_or_else(|| stake_pool.requires_collections.clone());
    stake_pool.requires_creators = ix.requires_creators.unwrap_or_else(|| stake_pool.requires_creators.clone());
    stake_pool.requires_authorization = ix.requires_authorization.unwrap_or_else(|| stake_pool.requires_authorization.clone());
    stake_pool.overlay_text = ix.overlay_text.unwrap_or_else(|| stake_pool.overlay_text.clone());
    stake_pool.image_uri = ix.image_uri.unwrap_or_else(|| stake_pool.image_uri.clone());
    stake_pool.authority = ix.authority.unwrap_or_else(|| stake_pool.authority.clone());
    stake_pool.reset_on_stake = ix.reset_on_stake.unwrap_or_else(|| stake_pool.reset_on_stake.clone());

    Ok(())
}
