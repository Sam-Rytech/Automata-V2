import { formatEther } from 'viem'
import { baseClient, celoClient, ethClient } from '../adapters/evm'

// Standardized gas limit estimates for common DeFi actions
const GAS_LIMITS: Record<string, bigint> = {
  SWAP: 250000n,
  BRIDGE: 300000n,
  STAKE: 200000n,
  TRANSFER: 65000n,
}

// Simplified mock prices for USD conversion (in production, use an oracle like Chainlink)
const MOCK_NATIVE_PRICES_USD: Record<string, number> = {
  base: 3500.0, // ETH
  ethereum: 3500.0, // ETH
  celo: 0.8, // CELO
  stellar: 0.1, // XLM (Base fee is fixed, handling separately)
}

function getClient(chain: string) {
  switch (chain) {
    case 'base':
      return baseClient
    case 'celo':
      return celoClient
    case 'ethereum':
      return ethClient
    default:
      return null
  }
}

export async function estimateFees(actions: any[]): Promise<any> {
  let totalFeeUSD = 0
  const breakdown = []

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    let stepFeeUSD = 0

    if (action.chain === 'stellar' || action.sourceChain === 'stellar') {
      // Stellar base fee is flat 100 stroops (0.00001 XLM)
      stepFeeUSD = 0.00001 * MOCK_NATIVE_PRICES_USD.stellar
    } else {
      const client = getClient(action.chain || action.sourceChain)
      if (client) {
        try {
          // Fetch real-time network gas price
          const gasPrice = await client.getGasPrice()
          const gasLimit = GAS_LIMITS[action.type] || 150000n

          const totalGasNative = gasPrice * gasLimit
          const nativeFormatted = parseFloat(formatEther(totalGasNative))

          const tokenPrice =
            MOCK_NATIVE_PRICES_USD[action.chain || action.sourceChain] || 1
          stepFeeUSD = nativeFormatted * tokenPrice
        } catch (error) {
          console.error(`Failed to estimate gas for ${action.chain}:`, error)
          // Fallback logic if RPC fails
          stepFeeUSD = 0.5
        }
      }
    }

    totalFeeUSD += stepFeeUSD
    breakdown.push({
      step: i + 1,
      action: action.type,
      estimatedFeeUSD: stepFeeUSD.toFixed(4),
    })
  }

  return {
    totalEstimatedFeeUSD: totalFeeUSD.toFixed(2),
    breakdown,
    warning:
      totalFeeUSD > 15
        ? 'Network congestion detected — fees are unusually high right now.'
        : null,
  }
}
