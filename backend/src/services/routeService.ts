import { createConfig, getRoutes } from '@lifi/sdk';
import { horizonServer } from '../utils/rpc';
import { getStellarAsset } from '../adapters/stellar';

createConfig({
  integrator: 'automata',
  apiKey: process.env.LIFI_API_KEY || undefined,
});

const routeCache = new Map<string, any>();

const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

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

const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  ETH: 18,
  CELO: 18,
  CUSD: 18,
  CKES: 18,
};

// ── Stellar DEX price estimate via Horizon order book ────────────────────────

async function getStellarExpectedOutput(
  fromToken: string,
  toToken: string,
  amount: string
): Promise<{ estimatedOutput: string; routeId: string } | { error: string }> {
  try {
    const selling = getStellarAsset(fromToken);
    const buying  = getStellarAsset(toToken);

    const orderbook = await horizonServer.orderbook(selling, buying).limit(5).call();

    if (!orderbook.asks || orderbook.asks.length === 0) {
      return { error: `No liquidity found on Stellar DEX for ${fromToken} → ${toToken}` };
    }

    // Best ask price = how much toToken you get per fromToken
    const bestPrice = parseFloat(orderbook.asks[0].price);
    const inputAmount = parseFloat(amount);
    const estimatedOutput = (inputAmount * bestPrice).toFixed(7);

    // Generate a synthetic routeId for Stellar so the agent has something to reference
    const routeId = `stellar-${fromToken}-${toToken}-${Date.now()}`;

    return { estimatedOutput, routeId };
  } catch (error: any) {
    console.error('Stellar orderbook error:', error);
    return { error: `Failed to fetch Stellar DEX price: ${error.message}` };
  }
}

export async function getRoute(params: any): Promise<any> {
  // ── Stellar DEX route ─────────────────────────────────────────────────────
  if (
    params.fromChain?.toLowerCase() === 'stellar' &&
    params.toChain?.toLowerCase() === 'stellar'
  ) {
    const result = await getStellarExpectedOutput(
      params.fromToken,
      params.toToken,
      params.amount
    );

    if ('error' in result) return result;

    return {
      routeId: result.routeId,
      estimatedOutput: result.estimatedOutput,
      estimatedFeeUSD: '~$0.00',
      estimatedTimeSeconds: 5,
      steps: [{ stepNumber: 1, description: 'Stellar DEX path payment' }],
    };
  }

  // ── EVM route via LI.FI ───────────────────────────────────────────────────
  if (params.fromChain?.toLowerCase() === 'stellar' || params.toChain?.toLowerCase() === 'stellar') {
    return {
      error: 'Cross-chain Stellar routing is not yet supported. Use build_bridge_tx for USDC bridging.',
    };
  }

  const fromChainId = CHAIN_IDS[params.fromChain.toLowerCase()];
  const toChainId   = CHAIN_IDS[params.toChain.toLowerCase()];

  if (!fromChainId || !toChainId) {
    return { error: `Unsupported chain pair: ${params.fromChain} to ${params.toChain}` };
  }

  const fromTokenAddress = TOKEN_ADDRESSES[params.fromToken.toUpperCase()]?.[params.fromChain.toLowerCase()];
  const toTokenAddress   = TOKEN_ADDRESSES[params.toToken.toUpperCase()]?.[params.toChain.toLowerCase()];

  if (!fromTokenAddress || !toTokenAddress) {
    return { error: `Token not supported on requested chain.` };
  }

  const decimals = TOKEN_DECIMALS[params.fromToken.toUpperCase()];
  if (decimals === undefined) {
    return { error: `Unknown decimals for token: ${params.fromToken}` };
  }

  const fromAmount = BigInt(Math.round(parseFloat(params.amount) * Math.pow(10, decimals))).toString();

  try {
    const routesResult = await getRoutes({
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
      fromAddress: params.walletAddress,
    });

    if (!routesResult.routes || routesResult.routes.length === 0) {
      return { error: 'No routes found for this request. Try a different token pair or a larger amount.' };
    }

    const bestRoute = routesResult.routes[0];
    routeCache.set(bestRoute.id, bestRoute);

    const toDecimals = TOKEN_DECIMALS[params.toToken.toUpperCase()] || 18;
    const estimatedOutputHuman = (Number(bestRoute.toAmount) / Math.pow(10, toDecimals)).toFixed(4);

    return {
      routeId: bestRoute.id,
      estimatedOutput: estimatedOutputHuman,
      estimatedFeeUSD: bestRoute.gasCostUSD || '0.00',
      estimatedTimeSeconds: bestRoute.steps.reduce(
        (acc: number, step: any) => acc + step.estimate.executionDuration, 0
      ),
      steps: bestRoute.steps.map((step: any, idx: number) => ({
        stepNumber: idx + 1,
        description: `Execute via ${step.tool}`,
      })),
    };
  } catch (error: any) {
    console.error('LI.FI getRoutes error:', error);
    return { error: `Failed to fetch route from LI.FI: ${error.message}` };
  }
}

export function getCachedRoute(routeId: string): any {
  return routeCache.get(routeId);
}
