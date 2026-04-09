export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';
export type StatusPanelProps = {
  status: StatusState;
  message?: string;
  step?: number;
  totalSteps?: number;
  txHash?: string;
  chainId?: string;
};
export type PlanStep = {
  stepNumber: number;
  description: string;
  estimatedFeeUSD: string;
  estimatedTimeSeconds: number;
};
export type AgentPlan = {
  steps: PlanStep[];
  totalEstimatedFeeUSD: string;
  estimatedTimeSeconds: number;
  warnings: string[];
};
