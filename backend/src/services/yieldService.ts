export async function getYieldRates(chain: string, token: string): Promise<any> {
  const mockRates: Record<string, Record<string, number>> = {
    base:     { USDC: 5.2 },
    celo:     { USDC: 6.8, cUSD: 4.1 },
    ethereum: { USDC: 4.9 },
  };
  return {
    chain,
    token,
    rates: [
      { protocol: chain === 'celo' ? 'Mento' : 'Aave', apy: mockRates[chain]?.[token] ?? 4.0 },
    ],
  };
}
