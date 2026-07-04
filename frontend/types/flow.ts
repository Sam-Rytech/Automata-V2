export type ActionType = 'SWAP' | 'BRIDGE' | 'STAKE' | 'TRANSFER' | 'SEND';
export type ChainId = 'base' | 'celo' | 'ethereum' | 'stellar';

export type ActionNodeBaseData = {
  type: ActionType;
  stepIndex?: number;
  protocol?: string;
  color?: string;
};

export type ActionNodeChainData = {
  fromChain?: string;
  toChain?: string;
  fromToken?: string;
  toToken?: string;
  asset?: string;
  amount?: string;
  toAddress?: string;
};

export type ActionNodeCallbacks = {
  onDelete?: () => void;
  onUpdate?: (data: Partial<ActionNodeData>) => void;
};

export type ActionNodeData = ActionNodeBaseData & ActionNodeChainData & ActionNodeCallbacks;

// FIXED: Export StatusState here so the API can use it
export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';