import { Tool } from '@google/generative-ai';
import {
  getYieldOpportunities,
  buildEarnDepositTx,
  getEarnPositions,
} from '../services/yieldService'

export const AGENT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_balances',
        description:
          'Get token balances for a wallet address across Base, Celo, Ethereum, and Stellar.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            walletAddress: {
              type: 'STRING' as any,
              description: 'The 0x or Stellar address to check',
            },
            stellarAddress: {
              type: 'STRING' as any,
              description: 'The Stellar G address if available separately',
            },
          },
          required: ['walletAddress'],
        },
      },
      {
        name: 'get_route',
        description:
          'Find the best route to move or swap assets between chains. Call this before building any bridge or swap transaction.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            fromChain: {
              type: 'STRING' as any,
              description: 'Source chain: base, celo, ethereum, or stellar',
            },
            toChain: {
              type: 'STRING' as any,
              description:
                'Destination chain: base, celo, ethereum, or stellar',
            },
            fromToken: {
              type: 'STRING' as any,
              description: 'Token to send (e.g. USDC, ETH)',
            },
            toToken: {
              type: 'STRING' as any,
              description: 'Token to receive (e.g. XLM, cKES)',
            },
            amount: {
              type: 'STRING' as any,
              description: 'Amount to send as a string (e.g. "100.00")',
            },
            walletAddress: {
              type: 'STRING' as any,
              description: 'The sender wallet address',
            },
          },
          required: [
            'fromChain',
            'toChain',
            'fromToken',
            'toToken',
            'amount',
            'walletAddress',
          ],
        },
      },
      {
        name: 'get_yield_rates',
        description:
          'Get current yield opportunities and APY rates from LI.FI Earn. Call this whenever the user asks about earning yield, staking, APY, or the best place to put their tokens.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            chain: {
              type: 'STRING' as any,
              description:
                'Optional chain filter (e.g. base, ethereum, arbitrum). Omit to search all chains.',
            },
            token: {
              type: 'STRING' as any,
              description:
                'Optional token filter (e.g. USDC, ETH). Omit to search all tokens.',
            },
            protocol: {
              type: 'STRING' as any,
              description:
                'Optional protocol filter (e.g. aave, compound). Omit to search all protocols.',
            },
          },
          required: [],
        },
      },
      {
        name: 'build_bridge_tx',
        description:
          'Build an unsigned USDC bridge transaction using Circle CCTP V2. Only for USDC transfers between chains.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            fromChain: { type: 'STRING' as any, description: 'Source chain' },
            toChain: {
              type: 'STRING' as any,
              description: 'Destination chain',
            },
            amount: {
              type: 'STRING' as any,
              description: 'Amount of USDC to bridge',
            },
            walletAddress: {
              type: 'STRING' as any,
              description: 'Sender wallet address',
            },
            recipientAddress: {
              type: 'STRING' as any,
              description: 'Recipient address (can be same as sender)',
            },
          },
          required: [
            'fromChain',
            'toChain',
            'amount',
            'walletAddress',
            'recipientAddress',
          ],
        },
      },
      {
        name: 'build_swap_tx',
        description:
          'Build an unsigned swap transaction. For Stellar swaps (e.g. XLM to USDC on Stellar DEX), set fromChain to "stellar" and omit routeId. For EVM swaps, provide routeId from get_route.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            routeId: {
              type: 'STRING' as any,
              description:
                'Route ID from get_route. Required for EVM swaps, omit for Stellar swaps.',
            },
            walletAddress: {
              type: 'STRING' as any,
              description: 'Sender wallet address',
            },
            fromAddress: {
              type: 'STRING' as any,
              description:
                'Stellar sender address (required for Stellar swaps)',
            },
            fromToken: {
              type: 'STRING' as any,
              description: 'Token to swap from (e.g. XLM, USDC)',
            },
            toToken: {
              type: 'STRING' as any,
              description: 'Token to swap to (e.g. USDC, XLM)',
            },
            fromChain: {
              type: 'STRING' as any,
              description: 'Chain to swap on: base, celo, ethereum, or stellar',
            },
            toChain: {
              type: 'STRING' as any,
              description: 'Destination chain (for cross-chain swaps)',
            },
            amount: { type: 'STRING' as any, description: 'Amount to swap' },
            minDestAmount: {
              type: 'STRING' as any,
              description:
                'Minimum amount to receive (slippage protection, required for Stellar swaps)',
            },
          },
          required: [
            'walletAddress',
            'fromToken',
            'toToken',
            'fromChain',
            'amount',
          ],
        },
      },
      {
        name: 'build_stake_tx',
        description:
          'Build an unsigned deposit transaction for a yield opportunity via LI.FI Earn. Only call this after the user has explicitly confirmed they want to deposit. Requires an opportunityId from get_yield_rates.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            opportunityId: {
              type: 'STRING' as any,
              description: 'The opportunity ID from get_yield_rates',
            },
            walletAddress: {
              type: 'STRING' as any,
              description: 'Wallet address making the deposit',
            },
            amount: {
              type: 'STRING' as any,
              description: 'Human-readable amount to deposit (e.g. "10.00")',
            },
            tokenDecimals: {
              type: 'NUMBER' as any,
              description: 'Token decimals: 6 for USDC, 18 for ETH',
            },
          },
          required: [
            'opportunityId',
            'walletAddress',
            'amount',
            'tokenDecimals',
          ],
        },
      },
      {
        name: 'verify_earn_position',
        description:
          'Check the active earn/yield positions for a wallet address. Call this after a deposit has been signed to confirm it was successful.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            walletAddress: {
              type: 'STRING' as any,
              description: 'Wallet address to check positions for',
            },
          },
          required: ['walletAddress'],
        },
      },
      {
        name: 'build_transfer_tx',
        description:
          'Build an unsigned simple token transfer to another address.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            chain: { type: 'STRING' as any, description: 'Chain to send on' },
            token: { type: 'STRING' as any, description: 'Token to send' },
            amount: { type: 'STRING' as any, description: 'Amount to send' },
            fromAddress: {
              type: 'STRING' as any,
              description: 'Sender address',
            },
            toAddress: {
              type: 'STRING' as any,
              description: 'Recipient address',
            },
          },
          required: ['chain', 'token', 'amount', 'fromAddress', 'toAddress'],
        },
      },
      {
        name: 'estimate_fees',
        description:
          'Estimate the total fees for a set of planned actions. Always call this before showing a plan to the user.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            actions: {
              type: 'ARRAY' as any,
              description: 'Array of planned actions',
              items: { type: 'OBJECT' as any },
            },
          },
          required: ['actions'],
        },
      },
      {
        name: 'resolve_recipient',
        description:
          'Resolve a phone number or ENS name to a blockchain wallet address.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            identifier: {
              type: 'STRING' as any,
              description:
                'Phone number (e.g. +2341234567890) or ENS name (e.g. vitalik.eth)',
            },
          },
          required: ['identifier'],
        },
      },
    ],
  },
]
