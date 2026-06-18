import { saveHistoryToDb, UnsignedTx } from '@/lib/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://automata-backend-production.up.railway.app';
const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

const handleStellarTransaction = async (
  tx: UnsignedTx,
  stellarContext: { address: string | null; signTransaction: (xdr: string) => Promise<string>; }
) => {
  if (!stellarContext.address) {
    throw new Error('No Stellar wallet connected. Please connect your Stellar wallet in the sidebar.');
  }
  if (!tx.xdr) {
    throw new Error('No XDR found for Stellar transaction.');
  }
  const { Horizon, Transaction, Networks } = await import('@stellar/stellar-sdk');
  const server = new Horizon.Server('https://horizon.stellar.org');
  const signedXdr = await stellarContext.signTransaction(tx.xdr);
  const horizonResult = await server.submitTransaction(new Transaction(signedXdr, Networks.PUBLIC));
  return horizonResult.hash;
};

const handleEvmTransaction = async (
  tx: UnsignedTx,
  activeWallet: any,
  meta: any
) => {
  const targetChainId = CHAIN_IDS[tx.chainId];
  if (targetChainId) {
    await activeWallet.switchChain(targetChainId);
  }
  const provider = await activeWallet.getEthereumProvider();
  const lastTxHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [{
      to: tx.to,
      data: tx.data,
      value: tx.value || '0x0',
      from: activeWallet.address,
    }],
  });
  if (meta?.destinationChain && meta?.destinationChain !== 'stellar' && (tx as any).txType === 'burn') {
    const attestRes = await fetch(`${BACKEND_URL}/api/bridge/attest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    lastTxHash = await mintProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: mintTx.to,
        data: mintTx.data,
        value: mintTx.value || '0x0',
        from: activeWallet.address,
      }],
    });
  }
  return lastTxHash;
};

const handleStellarRelay = async (
  tx: UnsignedTx,
  stellarContext: { address: string | null; signTransaction: (xdr: string) => Promise<string>; },
  meta: any,
  onBridgeRelayStarted?: () => void
) => {
  const recipientAddr = meta.recipientAddress || stellarContext.address;
  if (recipientAddr) {
    fetch(`${BACKEND_URL}/api/bridge/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        burnTxHash: tx.hash,
        recipientAddress: recipientAddr,
        amount: meta.amount,
      }),
    }).catch(err => console.error('[Bridge Relay] Failed to start relay:', err));
    if (onBridgeRelayStarted) {
      onBridgeRelayStarted();
    }
  }
};

export function useTransactionExecutor() {
  const executeSequence = async (
    txsToExecute: UnsignedTx[],
    activeWallet: any,
    stellarContext: { address: string | null; signTransaction: (xdr: string) => Promise<string>; },
    sourceContext: { type: 'AGENT_EXECUTION' | 'FLOW'; stepCount: number; },
    onBridgeRelayStarted?: () => void
  ) => {
    if (!activeWallet || txsToExecute.length === 0) {
      throw new Error('Missing wallet or transactions.');
    }
    let lastTxHash = '';
    try {
      for (const tx of txsToExecute) {
        if (tx.chainId === 'stellar') {
          lastTxHash = await handleStellarTransaction(tx, stellarContext);
        } else {
          lastTxHash = await handleEvmTransaction(tx, activeWallet, (tx as any).bridgeMeta);
        }
        if ((tx as any).bridgeMeta?.toChain === 'stellar' && (tx as any).txType === 'burn') {
          await handleStellarRelay(tx, stellarContext, (tx as any).bridgeMeta, onBridgeRelayStarted);
        }
      }
      try {
        await saveHistoryToDb(
          activeWallet.address,
          lastTxHash,
          sourceContext.type,
          'SUCCESS',
          {
            steps: sourceContext.stepCount,
            chainId: txsToExecute[0].chainId,
          }
        );
      } catch (dbErr) {
        console.error('Failed to log history to DB:', dbErr);
      }
      return lastTxHash;
    } catch (error: any) {
      try {
        await saveHistoryToDb(activeWallet.address, undefined, sourceContext.type, 'FAILED', {
          error: error.message,
        });
      } catch (e) {}
      throw error;
    }
  };
  return { executeSequence };
}
