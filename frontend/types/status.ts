export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';
export type OptionalProps = {
  message?: string;
  step?: number;
  totalSteps?: number;
  txHash?: string;
  chainId?: string;
};
export type StatusPanelProps = StatusState & OptionalProps;
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
export type PlanReviewProps = {
  plan: AgentPlan;
  onApprove: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
};