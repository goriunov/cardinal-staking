use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateRewardEntryIx {
    pub multipler: u64,
}

#[derive(Accounts)]
#[instruction(ix: UpdateRewardEntryIx)]
pub struct UpdateRewardEntryCtx<'info> {
    #[account(mut, constraint = reward_entry.reward_distributor == reward_distributor.key() @ ErrorCode::InvalidRewardDistributor)]
    reward_entry: Box<Account<'info, RewardEntry>>,
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    #[account(constraint = payer.key() == reward_distributor.authority @ ErrorCode::InvalidRewardDistributorAuthority)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateRewardEntryCtx>, ix: UpdateRewardEntryIx) -> Result<()> {
    let reward_entry = &mut ctx.accounts.reward_entry;
    reward_entry.multiplier = ix.multipler;
    Ok(())
}
