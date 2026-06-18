import { saveHistoryToDb, UnsignedTx } from '@/lib/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://automata-backend-production.up.railway.app';
const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

const handleEvmToEvmBridgeAttest = async (
  activeWallet: any,
  provider: any,
  meta: any,
  lastTxHash: string
) => {
  try {
    const attestRes = await fetch(`${BACKEND_URL}/api/bridge/attest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        burnTxHash: lastTxHash,
        sourceChain: meta.sourceChain,
        destinationChain: meta.destinationChain,
        recipientAddress: meta.recipientAddress || activeWallet.address,
        amount: meta.amount,
      }),
    });
    if (!attestRes.ok) {
      throw new Error(`Attestation failed: ${await attestRes.text()}`);
    }
    const { unsignedTx: mintTx } = await attestRes.json();
    if (!mintTx) {
      throw new Error('No mint transaction returned from attestation.');
    }
    const destChainId = CHAIN_IDS[meta.destinationChain];
    if (destChainId) {
      await activeWallet.switchChain(destChainId);
    }
    const mintProvider = await activeWallet.getEthereumProvider();
    const mintTxHash = await mintProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: mintTx.to,
        data: mintTx.data,
        value: mintTx.value || '0x0',
        from: activeWallet.address,
      }],
    });
    console.log(`[Bridge] Mint tx submitted on ${meta.destinationChain}: ${mintTxHash}`);
    return mintTxHash;
  } catch (error) {
    console.error('[Bridge Attest] Failed to handle attestation:', error);
    throw error;
  }
};

const handleStellarRelayTrigger = async (
  activeWallet: any,
  stellarContext: any,
  meta: any,
  lastTxHash: string,
  onBridgeRelayStarted?: () => void
) => {
  try {
    const recipientAddr = meta.recipientAddress || stellarContext.address;
    if (recipientAddr) {
      await fetch(`${BACKEND_URL}/api/bridge/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          burnTxHash: lastTxHash,
          recipientAddress: recipientAddr,
          amount: meta.amount,
        }),
      });
      if (onBridgeRelayStarted) {
        onBridgeRelayStarted();
      }
    }
  } catch (error) {
    console.error('[Bridge Relay] Failed to start relay:', error);
  }
};

export function useTransactionExecutor() {
  const executeSequence = async (
    txsToExecute: UnsignedTx[],
    activeWallet: any,
    stellarContext: { address: string | null; signTransaction: (xdr: string) => Promise<string>; },
    sourceContext: { type: 'AGENT_EXECUTION' | 'FLOW'; stepCount: number; },
    onBridgeRelayStarted?: () => void
  ): Promise<string> => {
    if (!activeWallet || txsToExecute.length === 0) {
      throw new Error('Missing wallet or transactions.');
    }
    let lastTxHash = '';
    try {
      for (const tx of txsToExecute) {
        if (tx.chainId === 'stellar') {
          // ── Stellar signing path ────────────────────────────────────────
          if (!stellarContext.address) {
            throw new Error('No Stellar wallet connected. Please connect your Stellar wallet in the sidebar.');
          }
          if (!tx.xdr) {
            throw new Error('No XDR found for Stellar transaction.');
          }
          const signedXdr = await stellarContext.signTransaction(tx.xdr);
          const { Horizon, Transaction, Networks } = await import('@stellar/stellar-sdk');
          const server = new Horizon.Server('https://horizon.stellar.org');
          const horizonResult = await server.submitTransaction(
            new Transaction(signedXdr, Networks.PUBLIC)
          );
          lastTxHash = horizonResult.hash;
        } else {
          // ── EVM signing path ────────────────────────────────────────────
          const targetChainId = CHAIN_IDS[tx.chainId];
          if (targetChainId) {
            await activeWallet.switchChain(targetChainId);
          }
          const provider = await activeWallet.getEthereumProvider();
          lastTxHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              to: tx.to,
              data: tx.data,
              value: tx.value || '0x0',
              from: activeWallet.address,
            }],
          });
          const meta = (tx as any).bridgeMeta;
          if (
            meta?.destinationChain &&
            meta?.destinationChain !== 'stellar' &&
            (tx as any).txType === 'burn'
          ) {
            console.log(`[Bridge] Burn confirmed: ${lastTxHash}. Polling for attestation...`);
            lastTxHash = await handleEvmToEvmBridgeAttest(activeWallet, provider, meta, lastTxHash);
          }
          if (meta?.toChain === 'stellar' && (tx as any).txType === 'burn') {
            await handleStellarRelayTrigger(activeWallet, stellarContext, meta, lastTxHash, onBridgeRelayStarted);
          }
        }
      }
      // ── Database history ────────────────────────────────────────────────
      try {
        await saveHistoryToDb(
          activeWallet.address,
          lastTxHash,
          sourceContext.type,
          'SUCCESS',
          {
            steps: sourceContext.stepCount,
            chainId: txsToExecute[0].chainId
          }
        );
      } catch (dbErr) {
        console.error('Failed to log history to DB:', dbErr);
      }
      return lastTxHash;
    } catch (error: any) {
      try {
        await saveHistoryToDb(activeWallet.address, undefined, sourceContext.type, 'FAILED', {
          error: error.message
        });
      } catch (e) {}
      throw error;
    }
  };
  return { executeSequence };
}
