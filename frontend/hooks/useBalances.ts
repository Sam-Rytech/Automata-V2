import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, formatUnits, parseAbi } from 'viem';
import { base, celo } from 'viem/chains';
import { Horizon } from '@stellar/stellar-sdk';

// USDC Contract Addresses
const BASE_USDC_ADDRESS: string = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const CELO_USDC_ADDRESS = '0xcebA9300f2b948710d2653dD7B07f33A8B32118C';
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
]);
const baseClient = createPublicClient({ chain: base, transport: http(), });
const celoClient = createPublicClient({ chain: celo, transport: http(), });
const stellarServer = new Horizon.Server('https://horizon.stellar.org');

function formatBalance(value: string | number, maxDecimals: number = 2) {
  const num = Number(value);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: maxDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

function fetchEvmBalances(evmAddress: string) {
  return Promise.all([
    baseClient.getBalance({ address: evmAddress }),
    baseClient.readContract({ address: BASE_USDC_ADDRESS, abi: ERC20_ABI, functionName: 'balanceOf', args: [evmAddress] }),
    celoClient.getBalance({ address: evmAddress }),
    celoClient.readContract({ address: CELO_USDC_ADDRESS, abi: ERC20_ABI, functionName: 'balanceOf', args: [evmAddress] }),
  ]).then(([ethBal, baseUsdcBal, celoBal, celoUsdcBal]) => ({
    baseETH: formatBalance(formatUnits(ethBal, 18)),
    baseUSDC: formatBalance(formatUnits(baseUsdcBal, 6)),
    celoNative: formatBalance(formatUnits(celoBal, 18)),
    celoUSDC: formatBalance(formatUnits(celoUsdcBal, 6)),
  }));
}

function fetchStellarBalance(stellarAddress: string) {
  return stellarServer.loadAccount(stellarAddress).then((account) => {
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? { stellarXLM: formatBalance(nativeBalance.balance) } : { stellarXLM: '0.00' };
  });
}

export type Balances = {
  baseETH: string;
  baseUSDC: string;
  celoNative: string;
  celoUSDC: string;
  stellarXLM: string;
};

export function useBalances(evmAddress?: string | null, stellarAddress?: string | null) {
  return useQuery({
    queryKey: ['balances', evmAddress, stellarAddress],
    queryFn: async (): Promise<Balances> => {
      const results: Balances = {
        baseETH: '0.00',
        baseUSDC: '0.00',
        celoNative: '0.00',
        celoUSDC: '0.00',
        stellarXLM: '0.00',
      };

      if (evmAddress) {
        try {
          const evmResults = await fetchEvmBalances(evmAddress);
          Object.assign(results, evmResults);
        } catch (e) {
          console.error('Failed to fetch EVM balances', e);
        }
      }

      if (stellarAddress) {
        try {
          const stellarResults = await fetchStellarBalance(stellarAddress);
          Object.assign(results, stellarResults);
        } catch (e) {
          console.error('Failed to fetch Stellar balance', e);
        }
      }

      return results;
    },
    // Only refetch if we have at least one address to query, and refresh every 30 seconds
    enabled: !!evmAddress || !!stellarAddress,
    refetchInterval: 30000,
  });
}
