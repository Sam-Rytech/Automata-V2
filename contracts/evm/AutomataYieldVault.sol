// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * AutomataYieldVault
 * Minimal ERC-4626-style yield vault for a single underlying stablecoin on Celo
 * (e.g. cUSD or USDC). Designed to be the single deposit target the AI agent uses
 * for the "Earn" leg. The owner-controlled `strategy` address is what actually
 * deploys capital into Mento/Aave/Moola, so the strategy can be swapped without
 * users migrating shares.
 *
 * Share accounting follows the OpenZeppelin ERC-4626 math but is inlined to keep
 * this single-file and Remix-paste friendly.
 */

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

interface IStrategy {
    function totalAssets() external view returns (uint256);
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount, address to) external returns (uint256);
}

contract AutomataYieldVault {
    string  public name;
    string  public symbol;
    uint8   public immutable decimals;
    address public immutable asset;

    address public owner;
    address public strategy;
    uint16  public performanceFeeBps; // taken on withdraw against profit, max 2000 (20%)
    address public feeRecipient;

    uint256 private constant VIRTUAL_SHARES = 1000;
    uint256 private constant VIRTUAL_ASSETS = 1000;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public principal; // tracks deposited assets per user

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed sender, address indexed receiver, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, uint256 assets, uint256 shares, uint256 fee);
    event StrategyUpdated(address strategy);
    event FeeUpdated(uint16 feeBps, address feeRecipient);

    error NotOwner();
    error ZeroAmount();
    error InsufficientShares();
    error FeeTooHigh();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _feeRecipient,
        uint16  _performanceFeeBps
    ) {
        if (_performanceFeeBps > 2000) revert FeeTooHigh();
        asset             = _asset;
        name              = _name;
        symbol            = _symbol;
        decimals          = IERC20(_asset).decimals();
        owner             = msg.sender;
        feeRecipient      = _feeRecipient;
        performanceFeeBps = _performanceFeeBps;
    }

    function totalAssets() public view returns (uint256) {
        uint256 idle = IERC20(asset).balanceOf(address(this));
        uint256 deployed = strategy == address(0) ? 0 : IStrategy(strategy).totalAssets();
        return idle + deployed;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        return (assets * (totalSupply + VIRTUAL_SHARES)) / (totalAssets() + VIRTUAL_ASSETS);
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        return (shares * (totalAssets() + VIRTUAL_ASSETS)) / (totalSupply + VIRTUAL_SHARES);
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        if (assets == 0) revert ZeroAmount();
        shares = convertToShares(assets);
        _safeTransferFrom(asset, msg.sender, address(this), assets);
        _mint(receiver, shares);
        principal[receiver] += assets;

        if (strategy != address(0)) {
            IERC20(asset).approve(strategy, assets);
            IStrategy(strategy).deposit(assets);
        }
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function withdraw(uint256 shares, address receiver) external returns (uint256 assetsOut) {
        if (shares == 0) revert ZeroAmount();
        if (balanceOf[msg.sender] < shares) revert InsufficientShares();

        uint256 grossAssets = convertToAssets(shares);
        uint256 userPrincipal = (principal[msg.sender] * shares) / balanceOf[msg.sender];

        _burn(msg.sender, shares);
        principal[msg.sender] -= userPrincipal;

        uint256 needed = grossAssets;
        uint256 idle   = IERC20(asset).balanceOf(address(this));
        if (idle < needed && strategy != address(0)) {
            IStrategy(strategy).withdraw(needed - idle, address(this));
        }

        uint256 fee;
        if (grossAssets > userPrincipal && performanceFeeBps > 0) {
            uint256 profit = grossAssets - userPrincipal;
            fee = (profit * performanceFeeBps) / 10_000;
            if (fee > 0) _safeTransfer(asset, feeRecipient, fee);
        }

        assetsOut = grossAssets - fee;
        _safeTransfer(asset, receiver, assetsOut);
        emit Withdraw(msg.sender, receiver, assetsOut, shares, fee);
    }

    function setStrategy(address _strategy) external onlyOwner {
        if (strategy != address(0)) {
            uint256 deployed = IStrategy(strategy).totalAssets();
            if (deployed > 0) IStrategy(strategy).withdraw(deployed, address(this));
        }
        strategy = _strategy;
        if (_strategy != address(0)) {
            uint256 idle = IERC20(asset).balanceOf(address(this));
            if (idle > 0) {
                IERC20(asset).approve(_strategy, idle);
                IStrategy(_strategy).deposit(idle);
            }
        }
        emit StrategyUpdated(_strategy);
    }

    function setFee(uint16 _bps, address _recipient) external onlyOwner {
        if (_bps > 2000) revert FeeTooHigh();
        performanceFeeBps = _bps;
        feeRecipient      = _recipient;
        emit FeeUpdated(_bps, _recipient);
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        uint256 fromBalance = balanceOf[from];
        uint256 principalMoved = fromBalance > 0 ? (principal[from] * amount) / fromBalance : 0;
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        principal[from] -= principalMoved;
        principal[to]   += principalMoved;
        emit Transfer(from, to, amount);
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer failed");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transferFrom failed");
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply     += amount;
        balanceOf[to]   += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply     -= amount;
        emit Transfer(from, address(0), amount);
    }
}
