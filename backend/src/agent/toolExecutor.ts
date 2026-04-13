import { getBalances } from '../services/balanceService';
import { getRoute } from '../services/routeService';
// import { getYieldRates } from '../services/yieldService';
import { buildBridgeTx } from '../services/bridgeService';
import { buildSwapTx } from '../services/swapService';
import { buildStakeTx } from '../services/stakeService';
import { buildTransferTx } from '../services/transferService';
import { estimateFees } from '../services/feeService';
import { resolveRecipient } from '../services/resolverService';
import { X402PaymentHandler } from '../services/X402PaymentHandler';

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
        
      // --- PHASE 3: THE AUTONOMOUS PAYMENT INJECTION ---
      case 'get_yield_rates': {
        console.log(`[Tool] Agent executing get_yield_rates for ${args.token} on ${args.chain}`);
        
        const handler = new X402PaymentHandler();
        // Pointing straight to your production Railway server
        const url = 'https://automata-x402-production.up.railway.app/api/yield'; 
        
        try {
            // The handler catches the 402, pays 0.001 USDC, and retries!
            const yieldData = await handler.fetchProtectedData(url);
            
            return { 
                data: {
                    system_notice: "You just paid 0.001 USDC autonomously via the Stellar Mainnet to unlock this premium API data.",
                    rates: yieldData.rates
                }
            };
        } catch (error: any) {
            console.error("Failed to fetch yield data:", error.message);
            return { data: { error: "Failed to fetch premium yield data due to a payment or network error." } };
        }
      }
      // -------------------------------------------------

      case 'build_bridge_tx': {
        const result = await buildBridgeTx(args as { fromChain: string; toChain: string; amount: string; walletAddress: string; recipientAddress: string });
        const r = result as any;
        if (r.error) return { data: r };
        return { data: r.description, unsignedTx: r.unsignedTx };
      }
      case 'build_swap_tx': {
        const result = await buildSwapTx(args) as any;
        if (result.error) return { data: result };
        return { data: result.description, unsignedTx: result.unsignedTx };
      }
      case 'build_stake_tx': {
        const result = await buildStakeTx(args as { chain: string; protocol: string; token: string; amount: string; walletAddress: string }) as any;
        if (result.error) return { data: result };
        return { data: result.description, unsignedTx: result.unsignedTx };
      }
      case 'build_transfer_tx': {
        const result = await buildTransferTx(args) as any;
        if (result.error) return { data: result };
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