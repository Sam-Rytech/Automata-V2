import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = { title: 'Smart Contracts' }

export default function ContractsPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>06 ——</p>
      <h1>Smart Contracts</h1>
      <p>
        Automata has two EVM contracts written in Solidity 0.8.24 and three Clarity contracts for
        the Stacks ecosystem. The EVM contracts are written and reviewed but not yet deployed on
        any mainnet or testnet. See <a href="/status">Project Status</a>.
      </p>

      <div className="callout callout-warn">
        <strong>Deployment status:</strong> All contracts are undeployed as of v2.0.0. Deploying{' '}
        <code>AutomataRouter</code> on Celo testnet via Remix is a ~30-minute task. See the Priority
        Actions in the Status page.
      </div>

      <h2>AutomataRouter.sol</h2>
      <p>
        Located at <code>contracts/evm/AutomataRouter.sol</code>. This contract atomically chains
        multiple DeFi operations (approve → swap → bridge → stake) into a single user transaction.
        The user signs once; the router forwards each call in sequence.
      </p>

      <h3>Design Principles</h3>
      <ul>
        <li>
          <strong>Non-custodial invariant:</strong> Every batch execution must end with zero token
          balance in the router for all tokens listed in <code>sweepTokens</code>. If any token
          balance remains after the sweep, the transaction reverts.
        </li>
        <li>
          <strong>No cross-transaction custody:</strong> Funds are not held between calls. Pull →
          forward → sweep happens atomically.
        </li>
        <li>
          <strong>Reentrancy guard:</strong> Custom <code>nonReentrant</code> modifier using a
          private <code>_locked</code> boolean. No OpenZeppelin dependency.
        </li>
        <li>
          <strong>Fee mechanism:</strong> Optional platform fee in basis points (<code>feeBps</code>).
          Capped at 100 (1%). Taken from leftover tokens during sweep, forwarded to{' '}
          <code>feeRecipient</code>. Can be set to zero.
        </li>
      </ul>

      <h3>Data Structures</h3>
      <CodeBlock language="solidity">
{`struct Call {
    address target;   // Contract to call
    uint256 value;    // Native token (ETH/CELO) to forward with this call
    bytes   data;     // ABI-encoded calldata
}`}
      </CodeBlock>

      <h3>executeBatch</h3>
      <CodeBlock language="solidity" filename="contracts/evm/AutomataRouter.sol">
{`/**
 * Execute a sequence of calls in one transaction.
 * @param calls       Ordered list of low-level calls.
 * @param sweepTokens Tokens to sweep back to msg.sender at the end.
 *                    Any non-zero leftover after fee triggers a revert.
 */
function executeBatch(Call[] calldata calls, address[] calldata sweepTokens)
    external
    payable
    nonReentrant
{
    // Execute all calls in sequence
    for (uint256 i = 0; i < calls.length; ++i) {
        (bool ok, bytes memory ret) = calls[i].target.call{value: calls[i].value}(calls[i].data);
        if (!ok) revert CallFailed(i, ret);
    }

    // Sweep: collect fee, return net balance to caller
    for (uint256 i = 0; i < sweepTokens.length; ++i) {
        address token = sweepTokens[i];
        uint256 bal   = IERC20(token).balanceOf(address(this));
        if (bal == 0) continue;

        uint256 fee  = (bal * feeBps) / 10_000;
        uint256 net  = bal - fee;

        if (fee > 0) _safeTransfer(token, feeRecipient, fee);
        _safeTransfer(token, msg.sender, net);

        // Zero-balance invariant check
        uint256 remaining = IERC20(token).balanceOf(address(this));
        if (remaining != 0) revert LeftoverBalance(token, remaining);
    }

    // Return any native token (ETH/CELO) to caller
    if (address(this).balance > 0) {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "native refund failed");
    }

    emit BatchExecuted(msg.sender, calls.length, totalFee);
}`}
      </CodeBlock>

      <h3>Events</h3>
      <table>
        <thead><tr><th>Event</th><th>Parameters</th><th>Emitted When</th></tr></thead>
        <tbody>
          <tr><td>BatchExecuted</td><td>user, calls, feeTaken</td><td>After successful executeBatch</td></tr>
          <tr><td>FeeUpdated</td><td>feeBps, feeRecipient</td><td>setFee() called by owner</td></tr>
          <tr><td>OwnerUpdated</td><td>newOwner</td><td>setOwner() called by owner</td></tr>
        </tbody>
      </table>

      <h3>Custom Errors</h3>
      <table>
        <thead><tr><th>Error</th><th>Condition</th></tr></thead>
        <tbody>
          <tr><td>NotOwner()</td><td>Caller is not the owner on a protected function</td></tr>
          <tr><td>CallFailed(index, returnData)</td><td>One of the batch calls reverted — includes the index and return data for debugging</td></tr>
          <tr><td>LeftoverBalance(token, amount)</td><td>Token balance remains non-zero after sweep (sweep logic bug)</td></tr>
          <tr><td>FeeTooHigh()</td><td>Attempted to set feeBps &gt; 100 (1%)</td></tr>
        </tbody>
      </table>

      <h3>Admin Functions</h3>
      <CodeBlock language="solidity">
{`// Update platform fee (max 100 = 1%)
function setFee(uint16 _feeBps, address _feeRecipient) external onlyOwner

// Transfer contract ownership
function setOwner(address _owner) external onlyOwner

// Emergency: recover accidentally sent tokens or native token
function rescue(address token, uint256 amount, address to) external onlyOwner
// token == address(0) → rescues native token (ETH/CELO)`}
      </CodeBlock>

      <h3>Constructor</h3>
      <CodeBlock language="solidity">
{`constructor(address _feeRecipient, uint16 _feeBps) {
    // feeBps > 100 reverts at deployment
    owner        = msg.sender;
    feeRecipient = _feeRecipient;
    feeBps       = _feeBps;
}`}
      </CodeBlock>

      <h3>Deployment Parameters (Celo Testnet)</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Recommended Value</th></tr></thead>
        <tbody>
          <tr><td>_feeRecipient</td><td>Project treasury wallet address</td></tr>
          <tr><td>_feeBps</td><td>0 (no fee in Phase 1)</td></tr>
        </tbody>
      </table>

      {/* ── AutomataYieldVault ── */}
      <h2>AutomataYieldVault.sol</h2>
      <p>
        Located at <code>contracts/evm/AutomataYieldVault.sol</code>. A single-file ERC-4626-style
        yield vault for one underlying stablecoin. Designed to be the AI agent&apos;s single deposit
        target for the &quot;Earn&quot; leg — the strategy contract can be swapped out without users
        migrating shares.
      </p>

      <h3>Design Principles</h3>
      <ul>
        <li>
          <strong>Strategy pattern:</strong> The vault holds the asset and delegates to a{' '}
          <code>strategy</code> address for yield generation. Strategy can be replaced by the owner
          without disrupting depositors.
        </li>
        <li>
          <strong>ERC-4626 share math (inlined):</strong> Virtual offset of 1000 shares / 1000 assets
          prevents manipulation of the share price on empty vaults.
        </li>
        <li>
          <strong>Performance fee:</strong> Taken only on profit at withdrawal. Max 20% (2000 bps).
          Per-user principal tracking ensures the fee is calculated correctly per depositor.
        </li>
        <li>
          <strong>No OpenZeppelin:</strong> Entirely self-contained. Paste-friendly into Remix.
        </li>
      </ul>

      <h3>Core Math</h3>
      <CodeBlock language="solidity">
{`// Virtual offset prevents price manipulation on empty vault
uint256 private constant VIRTUAL_SHARES = 1000;
uint256 private constant VIRTUAL_ASSETS = 1000;

function convertToShares(uint256 assets) public view returns (uint256) {
    return (assets * (totalSupply + VIRTUAL_SHARES)) / (totalAssets() + VIRTUAL_ASSETS);
}

function convertToAssets(uint256 shares) public view returns (uint256) {
    return (shares * (totalAssets() + VIRTUAL_ASSETS)) / (totalSupply + VIRTUAL_SHARES);
}

function totalAssets() public view returns (uint256) {
    uint256 idle     = IERC20(asset).balanceOf(address(this));
    uint256 deployed = strategy == address(0) ? 0 : IStrategy(strategy).totalAssets();
    return idle + deployed;
}`}
      </CodeBlock>

      <h3>deposit</h3>
      <CodeBlock language="solidity">
{`function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
    if (assets == 0) revert ZeroAmount();
    shares = convertToShares(assets);
    _safeTransferFrom(asset, msg.sender, address(this), assets);
    _mint(receiver, shares);
    principal[receiver] += assets;  // track per-user cost basis

    // Forward to strategy if one is set
    if (strategy != address(0)) {
        IERC20(asset).approve(strategy, assets);
        IStrategy(strategy).deposit(assets);
    }
    emit Deposit(msg.sender, receiver, assets, shares);
}`}
      </CodeBlock>

      <h3>withdraw (with performance fee)</h3>
      <CodeBlock language="solidity">
{`function withdraw(uint256 shares, address receiver) external returns (uint256 assetsOut) {
    uint256 grossAssets  = convertToAssets(shares);
    uint256 userPrincipal = (principal[msg.sender] * shares) / balanceOf[msg.sender];

    _burn(msg.sender, shares);
    principal[msg.sender] -= userPrincipal;

    // Pull from strategy if vault doesn't have enough idle assets
    uint256 idle = IERC20(asset).balanceOf(address(this));
    if (idle < grossAssets && strategy != address(0)) {
        IStrategy(strategy).withdraw(grossAssets - idle, address(this));
    }

    // Performance fee taken only on profit
    if (grossAssets > userPrincipal && performanceFeeBps > 0) {
        uint256 profit = grossAssets - userPrincipal;
        uint256 fee    = (profit * performanceFeeBps) / 10_000;
        if (fee > 0) _safeTransfer(asset, feeRecipient, fee);
        assetsOut = grossAssets - fee;
    } else {
        assetsOut = grossAssets;
    }

    _safeTransfer(asset, receiver, assetsOut);
    emit Withdraw(msg.sender, receiver, assetsOut, shares, fee);
}`}
      </CodeBlock>

      <h3>Strategy Interface</h3>
      <CodeBlock language="solidity">
{`interface IStrategy {
    function totalAssets() external view returns (uint256);
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount, address to) external returns (uint256);
}
// Implement this to connect to Mento, Aave, Moola, or any yield source`}
      </CodeBlock>

      <h3>Constructor</h3>
      <CodeBlock language="solidity">
{`constructor(
    address _asset,              // ERC-20 stablecoin (e.g. cUSD on Celo)
    string memory _name,         // Vault share token name (e.g. "Automata cUSD Vault")
    string memory _symbol,       // Vault share token symbol (e.g. "avcUSD")
    address _feeRecipient,       // Performance fee recipient
    uint16  _performanceFeeBps   // Max 2000 (20%) — 0 is valid
)`}
      </CodeBlock>

      <h2>Stacks Contracts (Clarity)</h2>
      <p>
        Three Clarity contracts are written and tested at ~80% coverage. They are not deployed.
        Agent tooling (<code>enroll_stacker</code>, <code>deposit_sbtc</code>,{' '}
        <code>post_intent</code>) is not yet wired into <code>tools.ts</code> or{' '}
        <code>toolExecutor.ts</code>.
      </p>
      <table>
        <thead><tr><th>Contract</th><th>Purpose</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>automata-stacker.clar</td><td>sBTC stacking vault</td><td>Written + tested, not deployed</td></tr>
          <tr><td>automata-sbtc-vault.clar</td><td>sBTC yield vault</td><td>Written, no agent wiring</td></tr>
          <tr><td>automata-intent.clar</td><td>Intent escrow (v2 feature)</td><td>Written, no escrow/proof validation</td></tr>
        </tbody>
      </table>
    </div>
  )
}
