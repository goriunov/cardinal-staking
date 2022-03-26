use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, SetAuthority, Token},
    cardinal_stake_pool::state::StakePool,
    spl_token::instruction::AuthorityType,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitRewardDistributorIx {
    pub reward_amount: u64,
    pub reward_duration_seconds: u64,
    pub max_supply: Option<u64>,
}

#[derive(Accounts)]
pub struct InitRewardDistributorCtx<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        space = REWARD_DISTRIBUTOR_SIZE,
        seeds = [REWARD_DISTRIBUTOR_SEED.as_bytes(), stake_pool.key().as_ref()],
        bump,
    )]
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    stake_pool: Box<Account<'info, StakePool>>,
    reward_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    freeze_authority: Signer<'info>,
    #[account(mut)]
    payer: Signer<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitRewardDistributorCtx>, ix: InitRewardDistributorIx) -> Result<()> {
    let reward_distributor = &mut ctx.accounts.reward_distributor;
    reward_distributor.bump = *ctx.bumps.get("reward_distributor").unwrap();
    reward_distributor.stake_pool = ctx.accounts.stake_pool.key();
    reward_distributor.reward_mint = ctx.accounts.reward_mint.key();
    reward_distributor.reward_amount = ix.reward_amount;
    reward_distributor.reward_duration_seconds = ix.reward_duration_seconds;
    reward_distributor.max_supply = ix.max_supply;

    // set freeze authority of mint to mint manager
    let cpi_accounts = SetAuthority {
        account_or_mint: ctx.accounts.reward_mint.to_account_info(),
        current_authority: ctx.accounts.freeze_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::set_authority(cpi_context, AuthorityType::FreezeAccount, Some(reward_distributor.key()))?;
    return Ok(());
}
