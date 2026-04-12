import { USDC_ADDRESSES, getERC20Balance, getNativeBalance } from '../adapters/evm';
import { getStellarBalances } from '../adapters/stellar';

export async function getBalances(walletAddress: string, stellarAddress?: string): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {
    base: {},
    celo: {},
    ethereum: {},
    stellar: {},
  };

  if (walletAddress.startsWith('0x')) {
    const evmAddress = walletAddress as `0x${string}`;
    result.base.ETH = await getNativeBalance('base', evmAddress);
    result.base.USDC = await getERC20Balance('base', USDC_ADDRESSES.base, evmAddress);
    result.celo.CELO = await getNativeBalance('celo', evmAddress);
    result.celo.USDC = await getERC20Balance('celo', USDC_ADDRESSES.celo, evmAddress);
    result.ethereum.ETH = await getNativeBalance('ethereum', evmAddress);
    result.ethereum.USDC = await getERC20Balance('ethereum', USDC_ADDRESSES.ethereum, evmAddress);
  }

  const stellarAddr = stellarAddress || (walletAddress.startsWith('G') ? walletAddress : null);
  if (stellarAddr) {
    result.stellar = await getStellarBalances(stellarAddr);
  }

  return result;
}
