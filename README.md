# Cardinal

[![License](https://img.shields.io/badge/license-AGPL%203.0-blue)](https://github.com/cardinal-labs/cardinal-staking/blob/master/LICENSE)
[![Release](https://github.com/cardinal-labs/cardinal-staking/actions/workflows/release.yml/badge.svg?branch=v0.0.27)](https://github.com/cardinal-labs/cardinal-staking/actions/workflows/release.yml)

<p align="center">
    <img src="./images/banner.png" />
</p>

<p align="center">
    An open protocol for staking NFTs and FTs.
</p>

## Background

Cardinal staking is a suite of contracts for issuing staking NFTs and FTs. The simple program is a stake pool that tracks total stake duration. In addition there is an implementation of a token minting reward distributor. Cardinal staking works well with any standard NFT collection and also composes with other programs in the Cardinal NFT infrastructure ecosystem

## Packages

| Package                       | Description                              | Version                                                                                                                           | Docs                                                                                                             |
| :---------------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `cardinal-stake-pool`         | Stake pool tracking total stake duration | [![Crates.io](https://img.shields.io/crates/v/cardinal-stake-pool)](https://crates.io/crates/cardinal-stake-pool)                 | [![Docs.rs](https://docs.rs/cardinal-stake-pool/badge.svg)](https://docs.rs/cardinal-stake-pool)                 |
| `cardinal-reward-distributor` | Simple token minting rewards distributor | [![Crates.io](https://img.shields.io/crates/v/cardinal-reward-distributor)](https://crates.io/crates/cardinal-reward-distributor) | [![Docs.rs](https://docs.rs/cardinal-reward-distributor/badge.svg)](https://docs.rs/cardinal-reward-distributor) |
| `@cardinal/staking`           | TypeScript SDK for staking               | [![npm](https://img.shields.io/npm/v/@cardinal/staking.svg)](https://www.npmjs.com/package/@cardinal/staking)                     | [![Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://cardinal-labs.github.io/cardinal-staking/)     |

## Addresses

Program addresses are the same on devnet, testnet, and mainnet-beta.

- StakePool: [`stkBL96RZkjY5ine4TvPihGqW8UHJfch2cokjAPzV8i`](https://explorer.solana.com/address/stkBL96RZkjY5ine4TvPihGqW8UHJfch2cokjAPzV8i)
- RewardDistributor: [`rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp`](https://explorer.solana.com/address/rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp)

## Plugins

Cardinal stake pool is meant to be composable. A simple reward distributor is provided but any complex reward mechanics can be implemented in a similar manner. Other implementations of other reward distributors are welcomed and encouraged. Examples that could be built

- Tiered reward system that gives rewards based on stake tiers
- Arbitrary non-linear reward functions
- NFT mutator based on stake duration
- Random stake distributor that may or may not give a reward emulating a quest or mission with a probability of success

## Documentation

**Stake Type**

> Stake pool is designed to support 2 types of staking, `Locked` and `Escrow`.

- `StakeType::Locked`

  - When staking using the locked stake type, the token(s) will be locked into the stakers wallet and the stake timer will begin
  - This is useful for projects that have DAO or discord and want to maintain membership or voting rights
  - When a token is locked, it is non-tradeable and remains frozen in the holders wallet, but they are able to assert ownership of that token account and maintain any rights that gives in other sytems
  - Before unstaking, this locked token must be unlocked and returned to the stake pool, the current implementation makes use of the Cardinal Token Manager and the `InvalidationType::Return` - The way this works is that when staking the token is issued back to the staker from the stake pool, which means when this token manager is invalidated, it will be programatically returned back to the pool, ready for unstaking. The client abstracts this invalidation and return inside of the `unstake` api.

- `StakeType::Escrow`
  - When staked using escrow stake type, the token(s) will be transferred into a token account owned by the stake entry and last staker is recorded
  - The current staker can unstake at any time to increment the stake timer for that mint

**Receipts**

> Receipts is a feature most useful for StakeType::Escrow that allows any staker to claim a receipt NFT representing their current stake

- Receipts are dynamic by default using the Cardinal metadata and img-generators hosted at `https://api.cardinal.so/metadata` and `https://api.cardinal.so/img` respectively
- Using a receipt combined with `StakeType::Escrow` allows the user to still maintain a record in their wallet of their stake even when the token is in escrow. An added benefit of this approach is that the receipt can be clearly identified in the wallet as a staked NFT rather than a locked one.
- Receipts are not extremely useful if using `StakeType::Locked`
- Any unstaking requires returning the receipt before usntake instruction can be called - This can be done by making use of the Cardinal Token Manager and `InvalidationType::Return` and, similar to how returning locked tokens work, this will be handled automatically by the client `unstake` api.

## Questions & Support

If you are developing using Cardinal staking contracts and libraries, feel free to reach out on Discord. We will work with you or your team to answer questions and provide development support and discuss new feature requests.

For issues please file a GitHub issue.

> https://discord.gg/bz2SxDQ8

## License

Cardinal Protocol is licensed under the GNU Affero General Public License v3.0.

In short, this means that any changes to this code must be made open source and available under the AGPL-v3.0 license, even if only used privately.
