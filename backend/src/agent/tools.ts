import { Tool } from '@google/generative-ai';

export const AGENT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_balances',
        description: 'Get token balances for a wallet address across Base, Celo, Ethereum, and Stellar.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            walletAddress: { type: 'STRING' as any, description: 'The 0x or Stellar address to check' },
          },
          required: ['walletAddress'],
        },
      },
      {
        name: 'get_route',
        description: 'Find the best route to move or swap assets between chains.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            fromChain: { type: 'STRING' as any },
            toChain:   { type: 'STRING' as any },
            fromToken: { type: 'STRING' as any },
            toToken:   { type: 'STRING' as any },
            amount:    { type: 'STRING' as any },
          },
          required: ['fromChain', 'toChain', 'fromToken', 'toToken', 'amount'],
        },
      },
    ],
  },
];
