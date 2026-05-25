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

export type UnsignedTx = {
  chainId: ChainId;
  to: string;
  data: string;
  value: string;
  description: string;
};
