export async function estimateFees(actions: any[]): Promise<any> {
  const perActionFee = 0.30;
  const total = actions.length * perActionFee;
  return {
    totalEstimatedFeeUSD: total.toFixed(2),
    breakdown: actions.map((a, i) => ({ step: i + 1, estimatedFeeUSD: perActionFee.toFixed(2) })),
    warning: total > 5 ? 'Fees are higher than usual' : null,
  };
}
