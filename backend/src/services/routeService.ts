import { createConfig, getRoutes } from '@lifi/sdk';

// Initialize LI.FI once
createConfig({
  integrator: 'automata',
  apiKey: process.env.LIFI_API_KEY || undefined,
});

// In-memory route cache (routeId → full LI.FI route object)
const routeCache = new Map<string, any>();

// Chain name → LI.FI chain ID
const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

// Token symbol + chain → contract address
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  USDC: {
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    celo: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  ETH: {
    base: '0x0000000000000000000000000000000000000000',
    ethereum: '0x0000000000000000000000000000000000000000',
  },
  CELO: {
    celo: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  },
  CUSD: {
    celo: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  },
  CKES: {
    celo: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
  },
};

// Token symbol → decimal places
const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  ETH: 18,
  CELO: 18,
  CUSD: 18,
  CKES: 18,
};

export async function getRoute(params: any): Promise<any> {
  // 1. Guard against Stellar routes (handled by CCTP)
  if (params.fromChain.toLowerCase() === 'stellar' || params.toChain.toLowerCase() === 'stellar') {
    return {
      error: "Stellar is not supported by LI.FI routing. Please use the build_bridge_tx tool (Circle CCTP) for Stellar USDC transfers."
    };
  }

  // 2. Map chain names to chain IDs
  const fromChainId = CHAIN_IDS[params.fromChain.toLowerCase()];
  const toChainId = CHAIN_IDS[params.toChain.toLowerCase()];

  if (!fromChainId || !toChainId) {
    return { error: `Unsupported chain pair: ${params.fromChain} to ${params.toChain}` };
  }

  // 3. Map token symbols to addresses
  const fromTokenAddress = TOKEN_ADDRESSES[params.fromToken.toUpperCase()]?.[params.fromChain.toLowerCase()];
  const toTokenAddress = TOKEN_ADDRESSES[params.toToken.toUpperCase()]?.[params.toChain.toLowerCase()];

  if (!fromTokenAddress || !toTokenAddress) {
    return { error: `Token not supported on requested chain.` };
  }

  // 4. Convert amount to smallest unit
  const decimals = TOKEN_DECIMALS[params.fromToken.toUpperCase()];
  if (decimals === undefined) {
    return { error: `Unknown decimals for token: ${params.fromToken}` };
  }
  
  const fromAmount = BigInt(Math.round(parseFloat(params.amount) * Math.pow(10, decimals))).toString();

  try {
    // 5. Call getRoutes()
    const routesResult = await getRoutes({
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
      fromAddress: params.walletAddress,
    });

    if (!routesResult.routes || routesResult.routes.length === 0) {
      return { error: "No routes found for this request. Try a different token pair or a larger amount." };
    }

    // 6. Take the best route and cache it
    const bestRoute = routesResult.routes[0];
    routeCache.set(bestRoute.id, bestRoute);

    // 7. Return summary for the agent
    const toDecimals = TOKEN_DECIMALS[params.toToken.toUpperCase()] || 18;
    const estimatedOutputHuman = (Number(bestRoute.toAmount) / Math.pow(10, toDecimals)).toFixed(4);

    return {
      routeId: bestRoute.id,
      estimatedOutput: estimatedOutputHuman,
      estimatedFeeUSD: bestRoute.gasCostUSD || "0.00",
      estimatedTimeSeconds: bestRoute.steps.reduce((acc: number, step: any) => acc + step.estimate.executionDuration, 0),
      steps: bestRoute.steps.map((step: any, idx: number) => ({
        stepNumber: idx + 1,
        description: `Execute via ${step.tool}`
      }))
    };
  } catch (error: any) {
    console.error('LI.FI getRoutes error:', error);
    return { error: `Failed to fetch route from LI.FI: ${error.message}` };
  }
}

export function getCachedRoute(routeId: string): any {
  return routeCache.get(routeId);
}