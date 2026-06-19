export type StatusState = 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error';
export type StepInfo = {
  step: number;
  totalSteps?: number;
};
export type StatusPanelProps = {
  status: StatusState;
  message?: string;
  stepInfo?: StepInfo;
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
export type PlanReviewProps = {
  plan: AgentPlan;
  onApprove: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
};