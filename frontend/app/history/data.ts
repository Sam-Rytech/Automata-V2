export type ActionType = 'ALL' | 'BRIDGE' | 'SWAP' | 'STAKE' | 'SEND';
export type TxStatus = 'CONFIRMED' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string;
  type: Exclude<ActionType, 'ALL'>;
  date: string;
  title: string;
  fromNetwork: string;
  toNetwork: string;
  status: TxStatus;
  hash: string;
}

export const TYPE_COLORS: Record<string, string> = {
  BRIDGE: '#E91E8C',
  SWAP: '#8B5CF6',
  STAKE: '#22C55E',
  SEND: '#F59E0B',
};

export const STATUS_COLORS: Record<TxStatus, string> = {
  CONFIRMED: '#22C55E',
  PENDING: '#F59E0B',
  FAILED: '#EF4444',
};

const generateMockTransaction = (id: string, type: Exclude<ActionType, 'ALL'>, date: string, title: string, fromNetwork: string, toNetwork: string, status: TxStatus, hash: string): Transaction => ({
  id,
  type,
  date,
  title,
  fromNetwork,
  toNetwork,
  status,
  hash,
});

const MOCK_TRANSACTIONS: Transaction[] = [
  generateMockTransaction('tx-1', 'BRIDGE', 'OCT 24, 2026 • 14:22 UTC', '100 USDC • Base → Stellar', 'BASE', 'STELLAR', 'CONFIRMED', '0x4a...d9e2'),
  generateMockTransaction('tx-2', 'SWAP', 'OCT 23, 2026 • 09:15 UTC', '0.5 ETH • WETH → XLM', 'ETHEREUM', 'ETHEREUM', 'PENDING', '0x9b...1f4c'),
  generateMockTransaction('tx-3', 'STAKE', 'OCT 22, 2026 • 22:45 UTC', '5,000 MATIC • Polygon Stake', 'POLYGON', 'STAKING_POOL', 'CONFIRMED', '0x2c...e8a1'),
  generateMockTransaction('tx-4', 'SEND', 'OCT 20, 2026 • 11:04 UTC', '2.0 SOL • Devnet → Mainnet', 'SOLANA', 'EXTERNAL', 'FAILED', '0xf5...c3b9'),
];

/** Simulates a real network fetch with a realistic latency. */
export async function fetchTransactions(): Promise<Transaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return MOCK_TRANSACTIONS;
}
