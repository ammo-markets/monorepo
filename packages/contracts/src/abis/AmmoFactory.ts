export const AmmoFactoryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "manager_",
        type: "address",
        internalType: "address",
      },
      {
        name: "usdc_",
        type: "address",
        internalType: "address",
      },
      {
        name: "usdcDecimals_",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "caliberIds",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calibers",
    inputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createCaliber",
    inputs: [
      {
        name: "caliberId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "oracle",
        type: "address",
        internalType: "address",
      },
      {
        name: "mintFeeBps",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "redeemFeeBps",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minMintRounds",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "market",
        type: "address",
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCaliberCount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "manager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AmmoManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usdcDecimals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "CaliberCreated",
    inputs: [
      {
        name: "caliberId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "market",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "CaliberExists",
    inputs: [],
  },
  {
    type: "error",
    name: "NotOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
] as const;
