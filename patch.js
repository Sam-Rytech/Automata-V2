const fs = require('fs')
const path = './backend/src/services/yieldService.ts'

let content = fs.readFileSync(path, 'utf8')

// Split the file right before the old LI.FI helper
const splitToken =
  '// ---------------------------------------------------------------------------'
const parts = content.split('// LI.FI Earn API — shared fetch helper')

if (parts.length < 2) {
  console.error('Could not find split point. Did the file change?')
  process.exit(1)
}

const newCode = `// LI.FI Earn API — Dual Service Architecture
// ---------------------------------------------------------------------------

const EARN_API = 'https://earn.li.fi';
const COMPOSER_API = 'https://li.quest';

// Service 1: Earn Data API (No auth required)
async function earnFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = \`\${EARN_API}\${path}\`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Accept': 'application/json', ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(\`Earn API error \${res.status}: \${body}\`);
  }
  return res.json();
}

// Service 2: Composer (API Key required)
async function composerFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = \`\${COMPOSER_API}\${path}\`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'x-lifi-integrator': LIFI_INTEGRATOR_ID,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(\`Composer API error \${res.status}: \${body}\`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// getYieldOpportunities — GET earn.li.fi/v1/earn/vaults
// ---------------------------------------------------------------------------
export async function getYieldOpportunities(chain?: string, token?: string, protocol?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (chain) {
    const chainId = chain.toLowerCase().includes('eth') ? '1' : '8453';
    params.set('chainId', chainId);
  }
  
  const query = params.toString() ? \`?\${params.toString()}\` : '';
  const data = await earnFetch(\`/v1/earn/vaults\${query}\`);
  
  const opportunities = data.data ?? [];
  
  // Sort by APY descending and only return transactional vaults
  return opportunities
    .filter((v: any) => v.isTransactional)
    .sort((a: any, b: any) => {
      const apyA = a.analytics?.apy?.total ?? 0;
      const apyB = b.analytics?.apy?.total ?? 0;
      return apyB - apyA;
    });
}

// ---------------------------------------------------------------------------
// buildEarnDepositTx — GET li.quest/v1/quote
// ---------------------------------------------------------------------------
export async function buildEarnDepositTx(
  opportunityId: string, 
  walletAddress: string, 
  amountHuman: number, 
  tokenDecimals: number
): Promise<{ approvalTx: any; depositTx: any; expiresAt: number }> {
  
  // opportunityId is the vault slug (e.g. "8453-0xbeef...")
  const parts = opportunityId.split('-');
  const chainIdStr = parts[0];
  const vaultAddress = parts.slice(1).join('-');
  
  // Fetch vault details to get the underlying token required for the quote
  const vaultsData = await earnFetch(\`/v1/earn/vaults?chainId=\${chainIdStr}\`);
  const vault = (vaultsData.data ?? []).find((v: any) => v.address.toLowerCase() === vaultAddress.toLowerCase());
  
  if (!vault) throw new Error(\`Vault \${opportunityId} not found\`);
  
  const fromToken = vault.underlyingTokens?.[0]?.address;
  if (!fromToken) throw new Error('No underlying token found for vault');

  const amountSmallest = BigInt(Math.round(amountHuman * (10 ** tokenDecimals))).toString();

  // GET request to Composer
  const quoteParams = new URLSearchParams({
    fromChain: chainIdStr,
    toChain: chainIdStr,
    fromToken: fromToken,
    toToken: vault.address,
    fromAddress: walletAddress,
    toAddress: walletAddress,
    fromAmount: amountSmallest
  });

  const data = await composerFetch(\`/v1/quote?\${quoteParams.toString()}\`);
  
  // Build raw approval tx if LI.FI indicates allowance is needed
  let approvalTx = null;
  if (data.estimate?.approvalAddress) {
    approvalTx = {
      to: fromToken,
      data: '0x095ea7b3' + data.estimate.approvalAddress.replace('0x', '').padStart(64, '0') + BigInt(amountSmallest).toString(16).padStart(64, '0')
    };
  }

  return {
    approvalTx,
    depositTx: data.transactionRequest ?? null,
    expiresAt: Date.now() + QUOTE_TTL_MS,
  };
}

// ---------------------------------------------------------------------------
// getEarnPositions — GET earn.li.fi/v1/earn/portfolio
// ---------------------------------------------------------------------------
export async function getEarnPositions(walletAddress: string): Promise<any[]> {
  try {
    const data = await earnFetch(\`/v1/earn/portfolio/\${walletAddress}/positions\`);
    return data.positions ?? [];
  } catch (e: any) {
    console.error('Failed to fetch positions:', e.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// formatOpportunitiesForAgent
// ---------------------------------------------------------------------------
export function formatOpportunitiesForAgent(opportunities: any[]): string {
  if (!opportunities || opportunities.length === 0) {
    return 'No yield opportunities found for the requested criteria.';
  }

  return opportunities.slice(0, 5).map((op: any, i: number) => {
    const apy = (op.analytics?.apy?.total ?? 0).toFixed(2);
    const tvlUsd = op.analytics?.tvl?.usd;
    const tvl = tvlUsd ? \`$\${(Number(tvlUsd) / 1000000).toFixed(1)}M TVL\` : 'Unknown TVL';
    const proto = op.protocol?.name ?? 'Unknown protocol';
    const network = op.network ?? 'Unknown network';
    const token = op.underlyingTokens?.[0]?.symbol ?? 'Unknown token';
    
    // We pass the API's native "slug" as the opportunityId
    return \`\${i + 1}. [ID: \${op.slug}] \${proto} on \${network} — \${token} — \${apy}% per year — \${tvl}\`;
  }).join('\\n');
}
`

fs.writeFileSync(path, parts[0] + newCode)
console.log('Successfully patched yieldService.ts with the official Earn API!')
