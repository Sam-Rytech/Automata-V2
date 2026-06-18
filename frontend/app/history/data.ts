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
  SWAP:   '#8B5CF6',
  STAKE:  '#22C55E',
  SEND:   '#F59E0B',
};

export const STATUS_COLORS: Record<TxStatus, string> = {
  CONFIRMED: '#22C55E',
  PENDING:   '#F59E0B',
  FAILED:    '#EF4444',
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'BRIDGE',
    date: 'OCT 24, 2026 • 14:22 UTC',
    title: '100 USDC • Base → Stellar',
    fromNetwork: 'BASE',
    toNetwork: 'STELLAR',
    status: 'CONFIRMED',
    hash: '0x4a...d9e2',
  },
  {
    id: 'tx-2',
    type: 'SWAP',
    date: 'OCT 23, 2026 • 09:15 UTC',
    title: '0.5 ETH • WETH → XLM',
    fromNetwork: 'ETHEREUM',
    toNetwork: 'ETHEREUM',
    status: 'PENDING',
    hash: '0x9b...1f4c',
  },
  {
    id: 'tx-3',
    type: 'STAKE',
    date: 'OCT 22, 2026 • 22:45 UTC',
    title: '5,000 MATIC • Polygon Stake',
    fromNetwork: 'POLYGON',
    toNetwork: 'STAKING_POOL',
    status: 'CONFIRMED',
    hash: '0x2c...e8a1',
  },
  {
    id: 'tx-4',
    type: 'SEND',
    date: 'OCT 20, 2026 • 11:04 UTC',
    title: '2.0 SOL • Devnet → Mainnet',
    fromNetwork: 'SOLANA',
    toNetwork: 'EXTERNAL',
    status: 'FAILED',
    hash: '0xf5...c3b9',
  },
];

/** Simulates a real network fetch with a realistic latency. */
export async function fetchTransactions(): Promise<Transaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return MOCK_TRANSACTIONS;
}
