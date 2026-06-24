export type ActionType = 'SWAP' | 'BRIDGE' | 'STAKE' | 'TRANSFER' | 'SEND';
export type ChainId = 'base' | 'celo' | 'ethereum' | 'stellar';

interface BaseActionNodeData {
  type: ActionType;
  stepIndex?: number;
  fromChain?: string;
  toChain?: string;
  fromToken?: string;
  toToken?: string;
  asset?: string;
  amount?: string;
  protocol?: string;
  toAddress?: string;
  color?: string;
}

interface ActionNodeData extends BaseActionNodeData {
  onDelete?: () => void;
  onUpdate?: (data: Partial<ActionNodeData>) => void;
}

export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';
export { ActionNodeData };
