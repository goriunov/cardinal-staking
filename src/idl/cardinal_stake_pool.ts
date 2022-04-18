export type CardinalStakePool = {
  version: "1.1.0";
  name: "cardinal_stake_pool";
  instructions: [
    {
      name: "initIdentifier";
      accounts: [
        {
          name: "identifier";
          isMut: true;
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
      args: [];
    },
    {
      name: "initPool";
      accounts: [
        {
          name: "stakePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identifier";
          isMut: true;
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
            defined: "InitPoolIx";
          };
        }
      ];
    },
    {
      name: "initEntry";
      accounts: [
        {
          name: "stakeEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "originalMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "originalMintMetadata";
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
          name: "user";
          type: "publicKey";
        }
      ];
    },
    {
      name: "initStakeMint";
      accounts: [
        {
          name: "stakeEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "originalMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "originalMintMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakeMint";
          isMut: true;
          isSigner: true;
        },
        {
          name: "stakeMintMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntryStakeMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenManagerProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenMetadataProgram";
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
            defined: "InitStakeMintIx";
          };
        }
      ];
    },
    {
      name: "authorizeMint";
      accounts: [
        {
          name: "stakePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeAuthorizationRecord";
          isMut: true;
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
          name: "mint";
          type: "publicKey";
        }
      ];
    },
    {
      name: "stake";
      accounts: [
        {
          name: "stakeEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntryOriginalMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "originalMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userOriginalMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "claimReceiptMint";
      accounts: [
        {
          name: "stakeEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "originalMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receiptMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntryReceiptMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userReceiptMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManagerReceiptMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenManager";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintCounter";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenManagerProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "unstake";
      accounts: [
        {
          name: "stakePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "originalMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakeEntryOriginalMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userOriginalMintTokenAccount";
          isMut: true;
          isSigner: false;
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
      name: "stakeEntry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "originalMint";
            type: "publicKey";
          },
          {
            name: "originalMintClaimed";
            type: "bool";
          },
          {
            name: "lastStaker";
            type: "publicKey";
          },
          {
            name: "lastStakedAt";
            type: "i64";
          },
          {
            name: "totalStakeSeconds";
            type: "i128";
          },
          {
            name: "stakeMintClaimed";
            type: "bool";
          },
          {
            name: "kind";
            type: "u8";
          },
          {
            name: "stakeMint";
            type: {
              option: "publicKey";
            };
          }
        ];
      };
    },
    {
      name: "stakePool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "identifier";
            type: "u64";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "requiresCreators";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "requiresCollections";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "requiresAuthorization";
            type: "bool";
          },
          {
            name: "overlayText";
            type: "string";
          },
          {
            name: "imageUri";
            type: "string";
          },
          {
            name: "resetOnStake";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "stakeAuthorizationRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "identifier";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "count";
            type: "u64";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitPoolIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "overlayText";
            type: "string";
          },
          {
            name: "imageUri";
            type: "string";
          },
          {
            name: "requiresCollections";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "requiresCreators";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "requiresAuthorization";
            type: "bool";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "resetOnStake";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "InitStakeMintIx";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "symbol";
            type: "string";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidOriginalMint";
      msg: "Original mint is invalid";
    },
    {
      code: 6001;
      name: "InvalidTokenManagerMint";
      msg: "Token Manager mint is invalid";
    },
    {
      code: 6002;
      name: "InvalidUserOriginalMintTokenAccount";
      msg: "Invalid user original mint token account";
    },
    {
      code: 6003;
      name: "InvalidUserMintTokenAccount";
      msg: "Invalid user token manager mint account";
    },
    {
      code: 6004;
      name: "InvalidStakeEntryOriginalMintTokenAccount";
      msg: "Invalid stake entry original mint token account";
    },
    {
      code: 6005;
      name: "InvalidStakeEntryMintTokenAccount";
      msg: "Invalid stake entry token manager mint token account";
    },
    {
      code: 6006;
      name: "InvalidUnstakeUser";
      msg: "Invalid unstake user only last staker can unstake";
    },
    {
      code: 6007;
      name: "InvalidStakePool";
      msg: "Invalid stake pool";
    },
    {
      code: 6008;
      name: "NoMintMetadata";
      msg: "No mint metadata";
    },
    {
      code: 6009;
      name: "MintNotAllowedInPool";
      msg: "Mint not allowed in this pool";
    },
    {
      code: 6010;
      name: "InvalidPoolAuthority";
      msg: "Invalid stake pool authority";
    },
    {
      code: 6011;
      name: "InvalidStakeType";
      msg: "Invalid stake type";
    },
    {
      code: 6012;
      name: "InvalidStakeEntryStakeTokenAccount";
      msg: "Invalid stake entry stake token account";
    },
    {
      code: 6013;
      name: "InvalidLastStaker";
      msg: "Invalid last staker";
    },
    {
      code: 6014;
      name: "InvalidTokenManagerProgram";
      msg: "Invalid token manager program";
    },
    {
      code: 6015;
      name: "InvalidReceiptMint";
      msg: "Invalid receipt mint";
    },
    {
      code: 6016;
      name: "StakeEntryAlreadyStaked";
      msg: "Stake entry already has tokens staked";
    }
  ];
};

export const IDL: CardinalStakePool = {
  version: "1.1.0",
  name: "cardinal_stake_pool",
  instructions: [
    {
      name: "initIdentifier",
      accounts: [
        {
          name: "identifier",
          isMut: true,
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
      args: [],
    },
    {
      name: "initPool",
      accounts: [
        {
          name: "stakePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identifier",
          isMut: true,
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
            defined: "InitPoolIx",
          },
        },
      ],
    },
    {
      name: "initEntry",
      accounts: [
        {
          name: "stakeEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "originalMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "originalMintMetadata",
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
          name: "user",
          type: "publicKey",
        },
      ],
    },
    {
      name: "initStakeMint",
      accounts: [
        {
          name: "stakeEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "originalMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "originalMintMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeMint",
          isMut: true,
          isSigner: true,
        },
        {
          name: "stakeMintMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntryStakeMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenManagerProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
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
            defined: "InitStakeMintIx",
          },
        },
      ],
    },
    {
      name: "authorizeMint",
      accounts: [
        {
          name: "stakePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeAuthorizationRecord",
          isMut: true,
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
          name: "mint",
          type: "publicKey",
        },
      ],
    },
    {
      name: "stake",
      accounts: [
        {
          name: "stakeEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntryOriginalMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "originalMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userOriginalMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "claimReceiptMint",
      accounts: [
        {
          name: "stakeEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "originalMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receiptMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntryReceiptMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userReceiptMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManagerReceiptMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenManager",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintCounter",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenManagerProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "unstake",
      accounts: [
        {
          name: "stakePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "originalMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakeEntryOriginalMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userOriginalMintTokenAccount",
          isMut: true,
          isSigner: false,
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
      name: "stakeEntry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "originalMint",
            type: "publicKey",
          },
          {
            name: "originalMintClaimed",
            type: "bool",
          },
          {
            name: "lastStaker",
            type: "publicKey",
          },
          {
            name: "lastStakedAt",
            type: "i64",
          },
          {
            name: "totalStakeSeconds",
            type: "i128",
          },
          {
            name: "stakeMintClaimed",
            type: "bool",
          },
          {
            name: "kind",
            type: "u8",
          },
          {
            name: "stakeMint",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "stakePool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "identifier",
            type: "u64",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "requiresCreators",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "requiresCollections",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "requiresAuthorization",
            type: "bool",
          },
          {
            name: "overlayText",
            type: "string",
          },
          {
            name: "imageUri",
            type: "string",
          },
          {
            name: "resetOnStake",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "stakeAuthorizationRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "identifier",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "count",
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitPoolIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "overlayText",
            type: "string",
          },
          {
            name: "imageUri",
            type: "string",
          },
          {
            name: "requiresCollections",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "requiresCreators",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "requiresAuthorization",
            type: "bool",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "resetOnStake",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "InitStakeMintIx",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidOriginalMint",
      msg: "Original mint is invalid",
    },
    {
      code: 6001,
      name: "InvalidTokenManagerMint",
      msg: "Token Manager mint is invalid",
    },
    {
      code: 6002,
      name: "InvalidUserOriginalMintTokenAccount",
      msg: "Invalid user original mint token account",
    },
    {
      code: 6003,
      name: "InvalidUserMintTokenAccount",
      msg: "Invalid user token manager mint account",
    },
    {
      code: 6004,
      name: "InvalidStakeEntryOriginalMintTokenAccount",
      msg: "Invalid stake entry original mint token account",
    },
    {
      code: 6005,
      name: "InvalidStakeEntryMintTokenAccount",
      msg: "Invalid stake entry token manager mint token account",
    },
    {
      code: 6006,
      name: "InvalidUnstakeUser",
      msg: "Invalid unstake user only last staker can unstake",
    },
    {
      code: 6007,
      name: "InvalidStakePool",
      msg: "Invalid stake pool",
    },
    {
      code: 6008,
      name: "NoMintMetadata",
      msg: "No mint metadata",
    },
    {
      code: 6009,
      name: "MintNotAllowedInPool",
      msg: "Mint not allowed in this pool",
    },
    {
      code: 6010,
      name: "InvalidPoolAuthority",
      msg: "Invalid stake pool authority",
    },
    {
      code: 6011,
      name: "InvalidStakeType",
      msg: "Invalid stake type",
    },
    {
      code: 6012,
      name: "InvalidStakeEntryStakeTokenAccount",
      msg: "Invalid stake entry stake token account",
    },
    {
      code: 6013,
      name: "InvalidLastStaker",
      msg: "Invalid last staker",
    },
    {
      code: 6014,
      name: "InvalidTokenManagerProgram",
      msg: "Invalid token manager program",
    },
    {
      code: 6015,
      name: "InvalidReceiptMint",
      msg: "Invalid receipt mint",
    },
    {
      code: 6016,
      name: "StakeEntryAlreadyStaked",
      msg: "Stake entry already has tokens staked",
    },
  ],
};
