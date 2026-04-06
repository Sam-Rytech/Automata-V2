export async function buildSwapTx(args: any) {
  return {
    description: "Swap " + args.fromToken + " to " + args.toToken + " via LI.FI",
    unsignedTx: {
      chainId: args.fromChain,
      to: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE", // LI.FI Diamond Contract
      data: "0x", // Mock Swap Calldata
      value: "0",
      description: "Confirm swap on " + args.fromChain
    }
  };
}
