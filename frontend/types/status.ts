export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';
export type OptionalStringFields = {
  message?: string;
  txHash?: string;
  chainId?: string;
};
export type StatusPanelProps = StatusState & OptionalStringFields & {
  step?: number;
  totalSteps?: number;
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
export type PlanReviewProps = {
  plan: AgentPlan;
  onApprove: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
};