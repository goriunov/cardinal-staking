use {
    crate::{state::*, errors::ErrorCode},
    anchor_lang::{prelude::*},
    cardinal_stake_pool::state::{StakePool},
    anchor_spl::token::{self, SetAuthority, TokenAccount},
};

#[derive(Accounts)]
pub struct SetClosedCtx<'info> {
    #[account(mut, constraint = reward_distributor.stake_pool == stake_pool.key())]
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut, constraint = signer.key() == stake_pool.authority @ErrorCode::InvalidAuthority)]
    signer: Signer<'info>,
}

pub fn handler(ctx: Context<SetClosedCtx>, closed: bool) -> Result<()> {
    let reward_distributor = ctx.accounts.reward_distributor;
    if closed {

    } else {
        let remaining_accs = &mut ctx.remaining_accounts.iter();
        match reward_distributor.kind {
            k if k == RewardDistributorKind::Mint as u8 => {
                let cpi_accounts = SetAuthority {
                    account_or_mint: reward_distributor.reward_mint,
                    current_authority: ctx.accounts.authority.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
                token::set_authority(cpi_context, AuthorityType::MintTokens, Some(reward_distributor.key()))?;
            }
            k if k == RewardDistributorKind::Treasury as u8 => {
                if ix.max_supply == None {
                    return Err(error!(ErrorCode::MaxSupplyRequired));
                }
                let reward_distributor_token_account_info = next_account_info(remaining_accs)?;
                let reward_distributor_token_account = Account::<TokenAccount>::try_from(reward_distributor_token_account_info)?;
                let authority_token_account_info = next_account_info(remaining_accs)?;
                let authority_token_account = Account::<TokenAccount>::try_from(authority_token_account_info)?;

                let cpi_accounts = token::Transfer {
                    from: authority_token_account.to_account_info(),
                    to: reward_distributor_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
                token::transfer(cpi_context, ix.max_supply.unwrap())?;
            }
            _ => return Err(error!(ErrorCode::InvalidRewardDistributorKind)),
        }
    }
    ctx.accounts.reward_distributor.closed = closed;
    return Ok(())
}