import { getBalances } from '../services/balanceService';
import { getRoute } from '../services/routeService';
import { getYieldRates } from '../services/yieldService';
import { buildBridgeTx } from '../services/bridgeService';
import { buildSwapTx } from '../services/swapService';
import { buildStakeTx } from '../services/stakeService';
import { buildTransferTx } from '../services/transferService';
import { estimateFees } from '../services/feeService';
import { resolveRecipient } from '../services/resolverService';

export async function executeTool(
  toolName: string,
  args: Record<string, any>,
  walletAddress: string,
  stellarAddress?: string
): Promise<{ data: any; unsignedTx?: any }> {
  try {
    switch (toolName) {
      case 'get_balances':
        return { data: await getBalances(args.walletAddress || walletAddress, args.stellarAddress || stellarAddress) };
      case 'get_route':
        return { data: await getRoute(args) };
      case 'get_yield_rates':
        return { data: await getYieldRates({ chain: args.chain, token: args.token }) };
      case 'build_bridge_tx': {
        const result = await buildBridgeTx(args as { fromChain: string; toChain: string; amount: string; walletAddress: string; recipientAddress: string });
        return { data: result.description, unsignedTx: result.unsignedTx };
      }
      case 'build_swap_tx': {
        const result = await buildSwapTx(args);
        return { data: result.description, unsignedTx: result.unsignedTx };
      }
      case 'build_stake_tx': {
        const result = await buildStakeTx(args as { chain: string; protocol: string; token: string; amount: string; walletAddress: string });
        return { data: result.description, unsignedTx: result.unsignedTx };
      }
      case 'build_transfer_tx': {
        const result = await buildTransferTx(args);
        return { data: result.description, unsignedTx: result.unsignedTx };
      }
      case 'estimate_fees':
        return { data: await estimateFees(args.actions) };
      case 'resolve_recipient':
        return { data: await resolveRecipient(args.identifier) };
      default:
        return { data: { error: 'Unknown tool: ' + toolName } };
    }
  } catch (error: any) {
    console.error('Tool execution error (' + toolName + '):', error);
    return { data: { error: error.message || 'Tool execution failed' } };
  }
}
