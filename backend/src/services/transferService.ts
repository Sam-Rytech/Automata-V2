import { parseUnits, encodeFunctionData, erc20Abi } from 'viem';
import { USDC_ADDRESSES } from '../adapters/evm';

export async function buildTransferTx(args: any): Promise<{ description: string; unsignedTx: any }> {
  if (args.token === 'USDC' && args.chain !== 'stellar') {
    const usdcAddress = USDC_ADDRESSES[args.chain];
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [args.toAddress as `0x${string}`, parseUnits(args.amount, 6)],
    });
    return {
      description: `Transfer ${args.amount} USDC to ${args.toAddress} on ${args.chain}`,
      unsignedTx: { chainId: args.chain, to: usdcAddress, data, value: '0', description: `Send ${args.amount} USDC` },
    };
  }
  return {
    description: `Transfer ${args.amount} ${args.token} to ${args.toAddress}`,
    unsignedTx: { chainId: args.chain, to: args.toAddress, data: '0x', value: '0', description: 'Transfer' },
  };
}
