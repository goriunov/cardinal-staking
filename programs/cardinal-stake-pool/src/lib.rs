pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("t1LVbNwJZT3pxFQHfY65jp6QbvcTvda6oPSbaeKbYEs");

#[program]
pub mod cardinal_stake_pool {
    use super::*;

    pub fn init_identifier(ctx: Context<InitIdentifierCtx>) -> Result<()> {
        init_identifier::handler(ctx)
    }

    pub fn init_pool(ctx: Context<InitPoolCtx>, ix: InitPoolIx) -> Result<()> {
        init_pool::handler(ctx, ix)
    }

    pub fn init_entry(ctx: Context<InitEntryCtx>) -> Result<()> {
        init_entry::handler(ctx)
    }

    pub fn init_receipt_mint(ctx: Context<InitReceiptMintCtx>, ix: InitReceiptMintIx) -> Result<()> {
        init_receipt_mint::handler(ctx, ix)
    }

    pub fn stake<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, StakeCtx<'info>>, stake_type: u8) -> Result<()> {
        stake::handler(ctx, stake_type)
    }

    pub fn claim_receipt_mint<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, ClaimReceiptMintCtx<'info>>) -> Result<()> {
        claim_receipt_mint::handler(ctx)
    }

    pub fn unstake(ctx: Context<UnstakeCtx>) -> Result<()> {
        unstake::handler(ctx)
    }
}
