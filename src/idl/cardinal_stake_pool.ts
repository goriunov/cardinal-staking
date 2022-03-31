export type CardinalStakePool = {
  version: "0.1.0";
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
      args: [];
    },
    {
      name: "initReceiptMint";
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
          name: "receiptMint";
          isMut: true;
          isSigner: true;
        },
        {
          name: "receiptMintMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeEntryReceiptMintTokenAccount";
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
          isMut: true;
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
            defined: "InitReceiptMintIx";
          };
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
      args: [
        {
          name: "stakeType";
          type: "u8";
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
          name: "stakeEntry";
          isMut: true;
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
            name: "originalMint";
            type: "publicKey";
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
            type: "i64";
          },
          {
            name: "stakeType";
            type: "u8";
          },
          {
            name: "receiptMint";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "receiptMintClaimed";
            type: "bool";
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
            name: "allowedCreators";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "allowedCollections";
            type: {
              vec: "publicKey";
            };
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
            name: "authority";
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
            name: "allowedCollections";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "allowedCreators";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "authority";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "InitReceiptMintIx";
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
    },
    {
      name: "StakeType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Unstaked";
          },
          {
            name: "Escrow";
          },
          {
            name: "Locked";
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
      name: "InvalidStakeEntryReceiptTokenAccount";
      msg: "Invalid stake entry receipt token account";
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
    }
  ];
};

export const IDL: CardinalStakePool = {
  version: "0.1.0",
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
      args: [],
    },
    {
      name: "initReceiptMint",
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
          name: "receiptMint",
          isMut: true,
          isSigner: true,
        },
        {
          name: "receiptMintMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeEntryReceiptMintTokenAccount",
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
          isMut: true,
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
            defined: "InitReceiptMintIx",
          },
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
      args: [
        {
          name: "stakeType",
          type: "u8",
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
          name: "stakeEntry",
          isMut: true,
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
            name: "originalMint",
            type: "publicKey",
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
            type: "i64",
          },
          {
            name: "stakeType",
            type: "u8",
          },
          {
            name: "receiptMint",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "receiptMintClaimed",
            type: "bool",
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
            name: "allowedCreators",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "allowedCollections",
            type: {
              vec: "publicKey",
            },
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
            name: "authority",
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
            name: "allowedCollections",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "allowedCreators",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "authority",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "InitReceiptMintIx",
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
    {
      name: "StakeType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Unstaked",
          },
          {
            name: "Escrow",
          },
          {
            name: "Locked",
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
      name: "InvalidStakeEntryReceiptTokenAccount",
      msg: "Invalid stake entry receipt token account",
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
  ],
};
