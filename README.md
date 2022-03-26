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

Cardinal staking is a suite of contracts for issuing staking NFTs and FTs. The simple program is a stake pool that tracks total stake duration. In addition there is an implementation of a token minting reward distributor

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

Cardinal stake pool is meant to be composable. A simple reward distributor is provided but any complex reward mechanics can be implemented in a similar manner

## Documentation

## License

Cardinal Protocol is licensed under the GNU Affero General Public License v3.0.

In short, this means that any changes to this code must be made open source and available under the AGPL-v3.0 license, even if only used privately.
