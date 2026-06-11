export type ActionType = 'SWAP' | 'BRIDGE' | 'STAKE' | 'TRANSFER' | 'SEND';
export type ChainId = 'base' | 'celo' | 'ethereum' | 'stellar';

export type ActionNodeData = {
  type: ActionType;
  stepIndex?: number;
  fromChain?: string;
  toChain?: string;
  fromToken?: string;
  toToken?: string;
  asset?: string; // FIXED: Added asset property
  amount?: string;
  protocol?: string;
  toAddress?: string;
  color?: string;
  onDelete?: () => void;
  onUpdate?: (data: Partial<ActionNodeData>) => void;
};

// FIXED: Export StatusState here so the API can use it
export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';