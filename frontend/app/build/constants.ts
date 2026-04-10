import { ActionType } from '@/types/flow';

export const TYPE_COLOURS: Record<string, string> = {
  SEND: '#E91E8C', SWAP: '#8B5CF6', BRIDGE: '#6A0DAD', STAKE: '#22C55E', TRANSFER: '#0EA5E9'
};

export const PALETTE_ITEMS = [
  { type: 'SEND' as ActionType, desc: 'Transfer to wallet' },
  { type: 'SWAP' as ActionType, desc: 'Execute asset trade' },
  { type: 'BRIDGE' as ActionType, desc: 'Cross-chain transfer' },
  { type: 'STAKE' as ActionType, desc: 'Deposit for yield' },
];

export const CHAINS = ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Celo', 'Stellar'];
export const ASSETS = ['USDC', 'ETH', 'WETH', 'DAI', 'USDT', 'CELO'];
export const PROTOCOLS = ['Aave', 'Mento', 'Compound'];
export const SLIPPAGE = ['0.1%', '0.5%', '1.0%', 'AUTO'];
