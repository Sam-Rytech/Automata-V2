export async function getRoute(args: any) {
  return {
    routeId: "lifi_route_" + Math.random().toString(36).substr(2, 9),
    fromChain: args.fromChain,
    toChain: args.toChain,
    fromToken: args.fromToken,
    toToken: args.toToken,
    amount: args.amount,
    estimatedFeeUSD: "1.20",
    estimatedTimeSeconds: 45,
    tool: "LI.FI"
  };
}
