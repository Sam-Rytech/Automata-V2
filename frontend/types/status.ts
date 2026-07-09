export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';
export type StatusPanelProps = {
  status: StatusState;
  message?: string;
  step?: number;
  totalSteps?: number;
  txHash?: string;
  chainId?: string;
};

export type BaseStep = {
  stepNumber: number;
  description: string;
};
export type PlanStep = BaseStep & {
  estimatedFeeUSD: string;
  estimatedTimeSeconds: number;
};
export type AgentPlan = {
  steps: PlanStep[];
  totalEstimatedFeeUSD: string;
  estimatedTimeSeconds: number;
  warnings: string[];
};
export type PlanReviewProps = {
  plan: AgentPlan;
  onApprove: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
};