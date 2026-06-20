import { saveHistoryToDb, UnsignedTx } from '@/lib/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://automata-backend-production.up.railway.app';
const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

const handleEvmSigning = async (
  tx: UnsignedTx,
  activeWallet: any,
  lastTxHash: string
) => {
  const targetChainId = CHAIN_IDS[tx.chainId];
  if (targetChainId) {
    await activeWallet.switchChain(targetChainId);
  }
  const provider = await activeWallet.getEthereumProvider();
  return await provider.request({
    method: 'eth_sendTransaction',
    params: [{
      to: tx.to,
      data: tx.data,
      value: tx.value || '0x0',
      from: activeWallet.address,
    }],
  });
};

const handleStellarSigning = async (
  tx: UnsignedTx,
  stellarContext: {
    address: string | null;
    signTransaction: (xdr: string) => Promise<string>;
  }
) => {
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
  return horizonResult.hash;
};

const handleBridgeAttestation = async (
  tx: UnsignedTx,
  activeWallet: any,
  lastTxHash: string,
  meta: any
) => {
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
  return await mintProvider.request({
    method: 'eth_sendTransaction',
    params: [{
      to: mintTx.to,
      data: mintTx.data,
      value: mintTx.value || '0x0',
      from: activeWallet.address,
    }],
  });
};

export function useTransactionExecutor() {
  const executeSequence = async (
    txsToExecute: UnsignedTx[],
    activeWallet: any,
    stellarContext: {
      address: string | null;
      signTransaction: (xdr: string) => Promise<string>;
    },
    sourceContext: {
      type: 'AGENT_EXECUTION' | 'FLOW';
      stepCount: number;
    },
    onBridgeRelayStarted?: () => void
  ) => {
    if (!activeWallet || txsToExecute.length === 0) {
      throw new Error('Missing wallet or transactions.');
    }
    let lastTxHash = '';
    try {
      for (const tx of txsToExecute) {
        if (tx.chainId === 'stellar') {
          lastTxHash = await handleStellarSigning(tx, stellarContext);
        } else {
          lastTxHash = await handleEvmSigning(tx, activeWallet, lastTxHash);
          const meta = (tx as any).bridgeMeta;
          if (
            meta?.destinationChain &&
            meta?.destinationChain !== 'stellar' &&
            (tx as any).txType === 'burn'
          ) {
            lastTxHash = await handleBridgeAttestation(
              tx,
              activeWallet,
              lastTxHash,
              meta
            );
          }
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
        await saveHistoryToDb(
          activeWallet.address,
          undefined,
          sourceContext.type,
          'FAILED',
          {
            error: error.message,
          }
        );
      } catch (e) {}
      throw error;
    }
  };
  return { executeSequence };
}
