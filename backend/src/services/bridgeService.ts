export async function buildBridgeTx(args: any) {
  return {
    description: "Move " + args.amount + " USDC from " + args.fromChain + " to " + args.toChain,
    unsignedTx: {
      chainId: args.fromChain,
      to: "0xbd3fa8dace04daca05b9bdd8b41f7b09f8fa9d92", // Circle CCTP TokenMessenger
      data: "0x", // Mock Burn Calldata
      value: "0",
      description: "Confirm move to " + args.toChain + " (Est. 60s)"
    }
  };
}
