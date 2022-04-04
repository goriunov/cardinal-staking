export type CardinalStakePool = {
  version: "0.0.0";
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
      name: "initFtEntry";
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
            type: "i64";
          },
          {
            name: "stakeMintClaimed";
            type: "bool";
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
    },
    {
      name: "ErrorCode";
      type: {
        kind: "enum";
        variants: [
          {
            name: "InvalidOriginalMint";
          },
          {
            name: "InvalidTokenManagerMint";
          },
          {
            name: "InvalidUserOriginalMintTokenAccount";
          },
          {
            name: "InvalidUserMintTokenAccount";
          },
          {
            name: "InvalidStakeEntryOriginalMintTokenAccount";
          },
          {
            name: "InvalidStakeEntryMintTokenAccount";
          },
          {
            name: "InvalidUnstakeUser";
          },
          {
            name: "InvalidStakePool";
          },
          {
            name: "NoMintMetadata";
          },
          {
            name: "MintNotAllowedInPool";
          },
          {
            name: "InvalidPoolAuthority";
          },
          {
            name: "InvalidStakeType";
          },
          {
            name: "InvalidStakeEntryStakeTokenAccount";
          },
          {
            name: "InvalidLastStaker";
          },
          {
            name: "InvalidTokenManagerProgram";
          },
          {
            name: "InvalidReceiptMint";
          }
        ];
      };
    }
  ];
};

export const IDL: CardinalStakePool = {
  version: "0.0.0",
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
      name: "initFtEntry",
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
            type: "i64",
          },
          {
            name: "stakeMintClaimed",
            type: "bool",
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
    {
      name: "ErrorCode",
      type: {
        kind: "enum",
        variants: [
          {
            name: "InvalidOriginalMint",
          },
          {
            name: "InvalidTokenManagerMint",
          },
          {
            name: "InvalidUserOriginalMintTokenAccount",
          },
          {
            name: "InvalidUserMintTokenAccount",
          },
          {
            name: "InvalidStakeEntryOriginalMintTokenAccount",
          },
          {
            name: "InvalidStakeEntryMintTokenAccount",
          },
          {
            name: "InvalidUnstakeUser",
          },
          {
            name: "InvalidStakePool",
          },
          {
            name: "NoMintMetadata",
          },
          {
            name: "MintNotAllowedInPool",
          },
          {
            name: "InvalidPoolAuthority",
          },
          {
            name: "InvalidStakeType",
          },
          {
            name: "InvalidStakeEntryStakeTokenAccount",
          },
          {
            name: "InvalidLastStaker",
          },
          {
            name: "InvalidTokenManagerProgram",
          },
          {
            name: "InvalidReceiptMint",
          },
        ],
      },
    },
  ],
};
