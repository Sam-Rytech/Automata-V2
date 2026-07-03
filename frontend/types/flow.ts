export type ActionType = 'SWAP' | 'BRIDGE' | 'STAKE' | 'TRANSFER' | 'SEND';
export type ChainId = 'base' | 'celo' | 'ethereum' | 'stellar';

export type ActionNodeBase = {
  type: ActionType;
  stepIndex?: number;
  onDelete?: () => void;
  onUpdate?: (data: Partial<ActionNodeData>) => void;
};

export type ActionNodeChainData = {
  fromChain?: string;
  toChain?: string;
};

export type ActionNodeTokenData = {
  fromToken?: string;
  toToken?: string;
  asset?: string;
  amount?: string;
  protocol?: string;
  toAddress?: string;
  color?: string;
};

export type ActionNodeData = ActionNodeBase & ActionNodeChainData & ActionNodeTokenData;

// FIXED: Export StatusState here so the API can use it
export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';