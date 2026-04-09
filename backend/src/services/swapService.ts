import { getStepTransaction } from '@lifi/sdk';
import { getCachedRoute } from './routeService';

export async function buildSwapTx(params: any): Promise<any> {
  try {
    // 1. Look up the cached route
    const route = getCachedRoute(params.routeId);

    if (!route) {
      return { 
        error: "Route not found in cache or expired. Please generate a new route first using get_route." 
      };
    }

    if (!route.steps || route.steps.length === 0) {
      return { error: "Invalid route object: no steps found." };
    }

    // 2. Call getStepTransaction for the first step
    const step = route.steps[0];
    const stepTx = await getStepTransaction(step);

    if (!stepTx.transactionRequest) {
      return { error: "LI.FI failed to return a transaction request for this step." };
    }

    const txRequest = stepTx.transactionRequest;

    const chainIdToName: Record<number, string> = {
      8453: 'base',
      42220: 'celo',
      1: 'ethereum'
    };
    
    // Safely cast chainId to a number so TS doesn't panic if it's undefined
    const safeChainId = Number(txRequest.chainId) || 0;
    const chainName = chainIdToName[safeChainId] || (txRequest.chainId?.toString() || 'unknown');
    const actionDesc = `Swap via LI.FI route ${params.routeId.slice(0, 6)}...`;

    // 3. Return the exact format expected by the agent
    return {
      description: actionDesc,
      unsignedTx: {
        to: txRequest.to,
        data: txRequest.data,
        value: txRequest.value?.toString() || "0",
        chainId: chainName,
        description: actionDesc
      }
    };

  } catch (error: any) {
    console.error('LI.FI buildSwapTx error:', error);
    return { error: `Failed to build swap transaction: ${error.message}` };
  }
}