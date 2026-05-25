export type ActionType = 'SWAP' | 'BRIDGE' | 'STAKE' | 'TRANSFER';
export type ChainId = 'base' | 'celo' | 'ethereum' | 'stellar';

export type Action = {
  type: ActionType;
  sourceChain: ChainId;
  destinationChain?: ChainId;
  fromToken: string;
  toToken: string;
  amount: string;
  protocol?: string;
};

export type AgentPlan = {
  steps: PlanStep[];
  totalEstimatedFeeUSD: string;
  estimatedTimeSeconds: number;
  warnings: string[];
};

export type PlanStep = {
  stepNumber: number;
  description: string; 
  action: Action;
  estimatedFeeUSD: string;
  estimatedTimeSeconds: number;
};

export type ExecuteRequest = {
  intent?: string;
  // FIXME: handle edge case when value is null
  actions?: Action[];
  walletAddress: string;
  mode: 'assisted' | 'autonomous';
  geminiApiKey: string;
};

export type ExecuteResponse = {
  plan: AgentPlan;
  unsignedTransactions: UnsignedTx[];
  sessionId: string;
};

export type UnsignedTx = {
  chainId: ChainId;
  to: string;
  data: string;
  value: string;
  description: string;
};
