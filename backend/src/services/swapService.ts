import { getStepTransaction } from '@lifi/sdk';
import { getCachedRoute } from './routeService';
import { buildStellarPathPayment } from '../adapters/stellar';

export async function buildSwapTx(params: any): Promise<any> {
  // ── Stellar DEX path payment ──────────────────────────────────────────────
  if (params.fromChain === 'stellar') {
    const { fromAddress, fromToken, toToken, amount, minDestAmount } = params;

    if (!fromAddress || !fromToken || !toToken || !amount) {
      return { error: 'Stellar swap requires fromAddress, fromToken, toToken, and amount.' };
    }

    try {
      const xdr = await buildStellarPathPayment(
        fromAddress,
        fromAddress,   // destination is self — swap, not a send
        fromToken,
        amount,
        toToken,
        minDestAmount || '0.0000001',
        []             // empty path — Horizon finds the best route automatically
      );

      return {
        description: `Swap ${amount} ${fromToken} to ${toToken} on Stellar DEX`,
        unsignedTx: {
          chainId: 'stellar',
          to: fromAddress,
          data: '0x',
          value: '0',
          xdr,
          description: `Swap ${amount} ${fromToken} → ${toToken} on Stellar DEX`,
        },
      };
    } catch (error: any) {
      console.error('Stellar swap error:', error);
      return { error: `Failed to build Stellar swap: ${error.message}` };
    }
  }

  // ── EVM swap via LI.FI ────────────────────────────────────────────────────
  try {
    const route = getCachedRoute(params.routeId);
    if (!route) {
      return {
        error: 'Route not found in cache or expired. Please generate a new route first using get_route.',
      };
    }
    if (!route.steps || route.steps.length === 0) {
      return { error: 'Invalid route object: no steps found.' };
    }

    const step = route.steps[0];
    const stepTx = await getStepTransaction(step);
    if (!stepTx.transactionRequest) {
      return { error: 'LI.FI failed to return a transaction request for this step.' };
    }

    const txRequest = stepTx.transactionRequest;
    const chainIdToName: Record<number, string> = {
      8453:  'base',
      42220: 'celo',
      1:     'ethereum',
    };

    const safeChainId = Number(txRequest.chainId) || 0;
    const chainName = chainIdToName[safeChainId] || (txRequest.chainId?.toString() || 'unknown');
    const actionDesc = `Swap via LI.FI route ${params.routeId.slice(0, 6)}...`;

    return {
      description: actionDesc,
      unsignedTx: {
        to:          txRequest.to,
        data:        txRequest.data,
        value:       txRequest.value?.toString() || '0',
        chainId:     chainName,
        description: actionDesc,
      },
    };
  } catch (error: any) {
    console.error('LI.FI buildSwapTx error:', error);
    return { error: `Failed to build swap transaction: ${error.message}` };
  }
}
