export type CardinalRewardDistributor = {
  version: "0.0.6";
  name: "cardinal_reward_distributor";
  instructions: [
    {
      name: "initRewardDistributor";
      accounts: [
        {
          name: "rewardDistributor";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "ix";
          type: {
            defined: "InitRewardDistributorIx";
          };
        }
      ];
    },
    {
      name: "initRewardEntry";
      accounts: [
        {
          name: "rewardEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardDistributor";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "ix";
          type: {
            defined: "InitRewardEntryIx";
          };
        }
      ];
    },
    {
      name: "claimRewards";
      accounts: [
        {
          name: "rewardEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardDistributor";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakeEntry";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userRewardMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "close";
      accounts: [
        {
          name: "rewardDistributor";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "rewardEntry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "rewardDistributor";
            type: "publicKey";
          },
          {
            name: "rewardSecondsReceived";
            type: "u64";
          },
          {
            name: "rewardAmountReceived";
            type: "u64";
          },
          {
            name: "multiplier";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "rewardDistributor";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "stakePool";
            type: "publicKey";
          },
          {
            name: "kind";
            type: "u8";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "rewardMint";
            type: "publicKey";
          },
          {
            name: "rewardAmount";
            type: "u64";
          },
          {
            name: "rewardDurationSeconds";
            type: "u64";
          },
          {
            name: "rewardsIssued";
            type: "u64";
          },
          {
            name: "maxSupply";
            type: {
              option: "u64";
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitRewardDistributorIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "rewardAmount";
            type: "u64";
          },
          {
            name: "rewardDurationSeconds";
            type: "u64";
          },
          {
            name: "kind";
            type: "u8";
          },
          {
            name: "supply";
            type: {
              option: "u64";
            };
          },
          {
            name: "maxSupply";
            type: {
              option: "u64";
            };
          }
        ];
      };
    },
    {
      name: "InitRewardEntryIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "multipler";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UpdateRewardEntryIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "multipler";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "RewardDistributorKind";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Mint";
          },
          {
            name: "Treasury";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidTokenAccount";
      msg: "Invalid token account";
    },
    {
      code: 6001;
      name: "InvalidRewardMint";
      msg: "Invalid reward mint";
    },
    {
      code: 6002;
      name: "InvalidUserRewardMintTokenAccount";
      msg: "Invalid user reward mint token account";
    },
    {
      code: 6003;
      name: "InvalidRewardDistributor";
      msg: "Invalid reward distributor";
    },
    {
      code: 6004;
      name: "InvalidRewardDistributorAuthority";
      msg: "Invalid reward distributor authority";
    },
    {
      code: 6005;
      name: "InvalidRewardDistributorKind";
      msg: "Invalid reward distributor kind";
    },
    {
      code: 6006;
      name: "SupplyRequired";
      msg: "Initial supply required for kind treasury";
    },
    {
      code: 6007;
      name: "InvalidAuthority";
      msg: "Invalid authority";
    },
    {
      code: 6008;
      name: "InvalidPoolDistributor";
      msg: "Invalid distributor for pool";
    },
    {
      code: 6009;
      name: "DistributorNotClosed";
      msg: "Distributor is already open";
    },
    {
      code: 6010;
      name: "DistributorAlreadyClosed";
      msg: "Distributor is already closed";
    }
  ];
};

export const IDL: CardinalRewardDistributor = {
  version: "0.0.6",
  name: "cardinal_reward_distributor",
  instructions: [
    {
      name: "initRewardDistributor",
      accounts: [
        {
          name: "rewardDistributor",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "ix",
          type: {
            defined: "InitRewardDistributorIx",
          },
        },
      ],
    },
    {
      name: "initRewardEntry",
      accounts: [
        {
          name: "rewardEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardDistributor",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "ix",
          type: {
            defined: "InitRewardEntryIx",
          },
        },
      ],
    },
    {
      name: "claimRewards",
      accounts: [
        {
          name: "rewardEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardDistributor",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeEntry",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userRewardMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "close",
      accounts: [
        {
          name: "rewardDistributor",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "rewardEntry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "rewardDistributor",
            type: "publicKey",
          },
          {
            name: "rewardSecondsReceived",
            type: "u64",
          },
          {
            name: "rewardAmountReceived",
            type: "u64",
          },
          {
            name: "multiplier",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "rewardDistributor",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "stakePool",
            type: "publicKey",
          },
          {
            name: "kind",
            type: "u8",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "rewardMint",
            type: "publicKey",
          },
          {
            name: "rewardAmount",
            type: "u64",
          },
          {
            name: "rewardDurationSeconds",
            type: "u64",
          },
          {
            name: "rewardsIssued",
            type: "u64",
          },
          {
            name: "maxSupply",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitRewardDistributorIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "rewardAmount",
            type: "u64",
          },
          {
            name: "rewardDurationSeconds",
            type: "u64",
          },
          {
            name: "kind",
            type: "u8",
          },
          {
            name: "supply",
            type: {
              option: "u64",
            },
          },
          {
            name: "maxSupply",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
    {
      name: "InitRewardEntryIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "multipler",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpdateRewardEntryIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "multipler",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RewardDistributorKind",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Mint",
          },
          {
            name: "Treasury",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidTokenAccount",
      msg: "Invalid token account",
    },
    {
      code: 6001,
      name: "InvalidRewardMint",
      msg: "Invalid reward mint",
    },
    {
      code: 6002,
      name: "InvalidUserRewardMintTokenAccount",
      msg: "Invalid user reward mint token account",
    },
    {
      code: 6003,
      name: "InvalidRewardDistributor",
      msg: "Invalid reward distributor",
    },
    {
      code: 6004,
      name: "InvalidRewardDistributorAuthority",
      msg: "Invalid reward distributor authority",
    },
    {
      code: 6005,
      name: "InvalidRewardDistributorKind",
      msg: "Invalid reward distributor kind",
    },
    {
      code: 6006,
      name: "SupplyRequired",
      msg: "Initial supply required for kind treasury",
    },
    {
      code: 6007,
      name: "InvalidAuthority",
      msg: "Invalid authority",
    },
    {
      code: 6008,
      name: "InvalidPoolDistributor",
      msg: "Invalid distributor for pool",
    },
    {
      code: 6009,
      name: "DistributorNotClosed",
      msg: "Distributor is already open",
    },
    {
      code: 6010,
      name: "DistributorAlreadyClosed",
      msg: "Distributor is already closed",
    },
  ],
};
