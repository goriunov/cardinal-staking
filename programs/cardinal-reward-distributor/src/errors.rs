use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Invalid reward mint")]
    InvalidRewardMint,
    #[msg("Invalid user reward mint token account")]
    InvalidUserRewardMintTokenAccount,
    #[msg("Invalid reward distributor")]
    InvalidRewardDistributor,
    #[msg("Invalid reward distributor authority")]
    InvalidRewardDistributorAuthority,
}
