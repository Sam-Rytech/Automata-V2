import { getBalances } from '../services/balanceService';
import { getRoute } from '../services/routeService';
import {
  getYieldOpportunities,
  buildEarnDepositTx,
  getEarnPositions,
  formatOpportunitiesForAgent,
} from '../services/yieldService'
import { buildBridgeTx } from '../services/bridgeService';
import { buildSwapTx } from '../services/swapService';
import { buildStakeTx } from '../services/stakeService';
import { buildTransferTx } from '../services/transferService';
import { estimateFees } from '../services/feeService';
import { resolveRecipient } from '../services/resolverService';
import { X402PaymentHandler } from '../services/X402PaymentHandler';

export async function executeTool(
  toolName: string,
  args: Record<string, any>,
  walletAddress: string,
  stellarAddress?: string
): Promise<{ data: any; unsignedTx?: any }> {
  try {
    switch (toolName) {
      case 'get_balances':
        return {
          data: await getBalances(
            args.walletAddress || walletAddress,
            args.stellarAddress || stellarAddress
          ),
        }
      case 'get_route':
        return { data: await getRoute(args) }

      // --- PHASE 3: THE AUTONOMOUS PAYMENT INJECTION + LI.FI EARN ---
      case 'get_yield_rates': {
        console.log(
          `[Tool] Agent executing get_yield_rates for ${args.token} on ${args.chain}`
        )

        // Step 1: Fire real on-chain X402 payment on Stellar mainnet
        let x402TxHash: string | null = null
        let x402Notice = ''
        try {
          const handler = new X402PaymentHandler()
          const url =
            'https://automata-x402-production.up.railway.app/api/yield'
          const x402Result = await handler.fetchProtectedData(url)
          x402TxHash = x402Result.x402TxHash ?? null
          if (x402TxHash) {
            x402Notice = `I autonomously paid 0.001 USDC on the Stellar mainnet to unlock this data. Proof: https://stellar.expert/explorer/public/tx/${x402TxHash}`
            console.log(`[Tool] X402 payment confirmed on-chain: ${x402TxHash}`)
          }
        } catch (x402Error: any) {
          // X402 failed — not fatal, continue with LI.FI Earn
          console.warn(
            '[Tool] X402 payment failed, continuing with LI.FI Earn:',
            x402Error.message
          )
        }

        // Step 2: Fetch real live opportunities from LI.FI Earn
        const opportunities = await getYieldOpportunities(
          args.chain,
          args.token,
          args.protocol
        )
        const formatted = formatOpportunitiesForAgent(opportunities)

        return {
          data: {
            ...(x402Notice ? { system_notice: x402Notice } : {}),
            ...(x402TxHash ? { payment_proof: x402TxHash } : {}),
            opportunities,
            formatted,
            count: opportunities.length,
          },
        }
      }
      // -------------------------------------------------

      case 'build_bridge_tx': {
        const result = await buildBridgeTx(
          args as {
            fromChain: string
            toChain: string
            amount: string
            walletAddress: string
            recipientAddress: string
          }
        )
        const r = result as any
        if (r.error) return { data: r }
        return { data: r.description, unsignedTx: r.unsignedTx }
      }
      case 'build_swap_tx': {
        const result = (await buildSwapTx(args)) as any
        if (result.error) return { data: result }
        return { data: result.description, unsignedTx: result.unsignedTx }
      }
      case 'build_stake_tx': {
        const {
          opportunityId,
          walletAddress: stakeWallet,
          amount,
          tokenDecimals,
        } = args
        if (
          !opportunityId ||
          !stakeWallet ||
          !amount ||
          tokenDecimals === undefined
        ) {
          return {
            data: {
              error:
                'build_stake_tx requires opportunityId, walletAddress, amount, and tokenDecimals.',
            },
          }
        }
        const quote = await buildEarnDepositTx(
          opportunityId,
          stakeWallet || walletAddress,
          parseFloat(amount),
          Number(tokenDecimals)
        )
        if (Date.now() > quote.expiresAt) {
          return {
            data: {
              error:
                'Quote expired before it could be returned. Please try again.',
            },
          }
        }
        const txsToSign: any[] = []
        if (quote.approvalTx)
          txsToSign.push({
            ...quote.approvalTx,
            chainId: args.chain || 'base',
            description: 'Approve token spend',
            type: 'approval',
          })
        if (quote.depositTx)
          txsToSign.push({
            ...quote.depositTx,
            chainId: args.chain || 'base',
            description: `Deposit ${amount} into yield vault`,
            type: 'deposit',
          })
        return {
          data: {
            message: `Deposit transaction ready. Expires in ${Math.round((quote.expiresAt - Date.now()) / 1000)}s.`,
            expiresAt: quote.expiresAt,
            stepCount: txsToSign.length,
          },
          unsignedTx: txsToSign[0] ?? null,
        }
      }
      case 'verify_earn_position': {
        const positions = await getEarnPositions(
          args.walletAddress || walletAddress
        )
        return { data: { positions, count: positions.length } }
      }
      case 'build_transfer_tx': {
        const result = (await buildTransferTx(args)) as any
        if (result.error) return { data: result }
        return { data: result.description, unsignedTx: result.unsignedTx }
      }
      case 'estimate_fees':
        return { data: await estimateFees(args.actions) }
      case 'resolve_recipient':
        return { data: await resolveRecipient(args.identifier) }
      default:
        return { data: { error: 'Unknown tool: ' + toolName } }
    }
  } catch (error: any) {
    console.error('Tool execution error (' + toolName + '):', error);
    return { data: { error: error.message || 'Tool execution failed' } };
  }
}