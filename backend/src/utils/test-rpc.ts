/**
 * test-rpc.ts — RPC connectivity test for all supported chains.
 *
 * Run from backend/ with:
 *   npx ts-node src/utils/test-rpc.ts
 *
 * What it tests:
 *   EVM     — fetches the latest block number from Base, Celo, Ethereum
 *   Horizon — loads a known Stellar account and reads its XLM balance
 *   Soroban — pings the Soroban RPC health endpoint
 *
 * All checks are independent. A failure on one does not stop the others.
 * Green = your RPC layer is wired correctly and ready for the agent.
 */

require('dotenv').config({ path: '../.env.local' });

import { baseClient, celoClient, ethClient, horizonServer, sorobanServer } from './rpc';

// A well-known funded Stellar mainnet account (SDF's own account — always exists)
const TEST_STELLAR_ACCOUNT = 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR';

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const DIM  = '\x1b[2m';
const RST  = '\x1b[0m';

async function check(label: string, fn: () => Promise<string>): Promise<boolean> {
  try {
    const detail = await fn();
    console.log(`  ${PASS} ${label}  ${DIM}${detail}${RST}`);
    return true;
  } catch (err: any) {
    console.log(`  ${FAIL} ${label}`);
    console.log(`     ${DIM}${err?.message ?? err}${RST}`);
    return false;
  }
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Automata — RPC connectivity test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  let failed = 0;

  const run = async (label: string, fn: () => Promise<string>) => {
    const ok = await check(label, fn);
    ok ? passed++ : failed++;
  };

  // ── EVM ───────────────────────────────────────────────────────────────────
  console.log('EVM chains:');

  await run('Base mainnet', async () => {
    const block = await baseClient.getBlockNumber();
    return `block #${block}`;
  });

  await run('Celo mainnet', async () => {
    const block = await celoClient.getBlockNumber();
    return `block #${block}`;
  });

  await run('Ethereum mainnet', async () => {
    const block = await ethClient.getBlockNumber();
    return `block #${block}`;
  });

  // ── Stellar: Horizon ──────────────────────────────────────────────────────
  console.log('\nStellar — Horizon:');

  await run('Account load', async () => {
    const account = await horizonServer.loadAccount(TEST_STELLAR_ACCOUNT);
    const xlm = account.balances.find((b: any) => b.asset_type === 'native');
    return `XLM balance: ${xlm?.balance ?? 'n/a'}`;
  });

  await run('Latest ledger', async () => {
    const ledger = await horizonServer.ledgers().order('desc').limit(1).call();
    const seq = ledger.records[0]?.sequence;
    return `ledger #${seq}`;
  });

  // ── Stellar: Soroban RPC ──────────────────────────────────────────────────
  console.log('\nStellar — Soroban RPC:');

  await run('Health check', async () => {
    const health = await sorobanServer.getHealth();
    return `status: ${health.status}`;
  });

  await run('Latest ledger', async () => {
    const info = await sorobanServer.getLatestLedger();
    return `ledger #${info.sequence}`;
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (failed === 0) {
    console.log(`  \x1b[32mAll ${passed} checks passed. RPC layer is ready.\x1b[0m`);
  } else {
    console.log(`  \x1b[32m${passed} passed\x1b[0m  \x1b[31m${failed} failed\x1b[0m`);
    console.log('\n  Likely causes:');
    console.log('  • Missing env var — check backend/.env has all 5 RPC URLs');
    console.log('  • Wrong URL — verify BASE_RPC_URL points to Base mainnet, not testnet');
    console.log('  • Alchemy/Infura key invalid or rate-limited');
    console.log('  • STELLAR_SOROBAN_URL missing (defaults to soroban-rpc.stellar.org)');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();