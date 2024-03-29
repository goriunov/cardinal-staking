use {crate::state::*, anchor_lang::prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitRewardEntryIx {
    pub mint: Pubkey,
}

#[derive(Accounts)]
#[instruction(ix: InitRewardEntryIx)]
pub struct InitRewardEntryCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = REWARD_ENTRY_SIZE,
        seeds = [REWARD_ENTRY_SEED.as_bytes(), reward_distributor.key().as_ref(), ix.mint.as_ref()],
        bump,
    )]
    reward_entry: Box<Account<'info, RewardEntry>>,
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitRewardEntryCtx>, ix: InitRewardEntryIx) -> Result<()> {
    let reward_entry = &mut ctx.accounts.reward_entry;
    reward_entry.bump = *ctx.bumps.get("reward_entry").unwrap();
    reward_entry.mint = ix.mint;
    reward_entry.reward_distributor = ctx.accounts.reward_distributor.key();
    reward_entry.reward_amount_received = 0;
    reward_entry.reward_seconds_received = 0;
    reward_entry.multiplier = 1;
    Ok(())
}
