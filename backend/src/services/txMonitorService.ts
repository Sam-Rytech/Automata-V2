// backend/src/services/txMonitorService.ts
// Step 4.5 — Real-time transaction monitor
// Polls chain RPC every 3s and pushes status updates through a WebSocket connection.

import { createPublicClient, http } from 'viem';
import { base, baseSepolia, celo, mainnet, sepolia } from 'viem/chains';
import type { WebSocket } from 'ws';

const IS_MAINNET = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Chain → viem chain object + RPC URL
// ---------------------------------------------------------------------------

function getChain(chainId: string) {
  switch (chainId) {
    case 'base':     return IS_MAINNET ? base     : baseSepolia;
    case 'celo':     return IS_MAINNET ? celo     : celo;        // no celoAlfajores in older viem
    case 'ethereum': return IS_MAINNET ? mainnet  : sepolia;
    default:         return IS_MAINNET ? base     : baseSepolia;
  }
}

function getRpcUrl(chainId: string): string {
  switch (chainId) {
    case 'base':     return process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';
    case 'celo':     return process.env.CELO_RPC_URL ?? 'https://forno.celo.org';
    case 'ethereum': return process.env.ETH_RPC_URL  ?? 'https://eth.llamarpc.com';
    default:         return process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';
  }
}

// ---------------------------------------------------------------------------
// Helper: send JSON through the WebSocket (safe — ignores closed connections)
// ---------------------------------------------------------------------------

function sendStatus(ws: WebSocket, payload: object): void {
  try {
    if (ws.readyState === 1) { // 1 = OPEN
      ws.send(JSON.stringify(payload));
    }
  } catch {
    // WebSocket closed between checks — safe to ignore
  }
}

// ---------------------------------------------------------------------------
// Main export: poll a transaction hash until confirmed, failed, or timed out.
// Call without await from the WebSocket message handler — this runs in the bg.
// ---------------------------------------------------------------------------

export async function pollTransactionStatus(
  ws:      WebSocket,
  txHash:  string,
  chainId: string
): Promise<void> {

  const client = createPublicClient({
    chain:     getChain(chainId),
    transport: http(getRpcUrl(chainId)),
  });

  const MAX_POLLS            = 60;    // 60 × 3s = 3 minutes max
  const POLL_INTERVAL_MS     = 3000;
  const CONFIRMATIONS_NEEDED = 2;

  let pollCount = 0;

  // Send an immediate "pending" so the frontend has something to show right away
  sendStatus(ws, { type: 'status', txHash, chainId, status: 'pending', confirmations: 0 });

  while (pollCount < MAX_POLLS) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    pollCount++;

    try {
      const receipt = await client.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (!receipt) {
        // Not yet mined
        sendStatus(ws, { type: 'status', txHash, chainId, status: 'pending', confirmations: 0, pollCount });
        continue;
      }

      if (receipt.status === 'reverted') {
        sendStatus(ws, { type: 'status', txHash, chainId, status: 'failed', error: 'Transaction reverted on chain.' });
        break;
      }

      // Mined — count confirmations
      const currentBlock  = await client.getBlockNumber();
      const confirmations = Number(currentBlock) - Number(receipt.blockNumber);

      if (confirmations >= CONFIRMATIONS_NEEDED) {
        sendStatus(ws, {
          type: 'status', txHash, chainId,
          status:      'confirmed',
          confirmations,
          blockNumber: Number(receipt.blockNumber),
        });
        break;
      } else {
        sendStatus(ws, {
          type: 'status', txHash, chainId,
          status:      'pending',
          confirmations,
          blockNumber: Number(receipt.blockNumber),
        });
      }

    } catch (err: any) {
      // Transient RPC error — log but keep polling
      console.error(`[txMonitor] Poll error for ${txHash} on ${chainId}:`, err.message);
    }
  }

  // Hit the poll limit without confirming
  if (pollCount >= MAX_POLLS) {
    sendStatus(ws, {
      type:  'status',
      txHash, chainId,
      status: 'failed',
      error:  'Monitoring timed out after 3 minutes. Check the explorer to confirm manually.',
    });
  }
}