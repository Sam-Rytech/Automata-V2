// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * AutomataRouter
 * Atomically chains approve -> swap -> bridge -> stake in a single user signature.
 * Backend builds one calldata array; user signs once; router forwards each Call.
 *
 * Design notes:
 * - Funds are pulled from the user via the first Call(s) (e.g. ERC20.approve target
 *   then transferFrom inside the integration), then each subsequent call operates
 *   on tokens already held by the router or by the integration target.
 * - Router never custodies user funds across transactions: every batch must end with
 *   a zero-balance invariant for the tokens listed in `sweepTokens`.
 * - A per-call `value` allows native CELO to be forwarded to bridge/swap contracts.
 */

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract AutomataRouter {
    bool private _locked;
    struct Call {
        address target;
        uint256 value;
        bytes   data;
    }

    address public owner;
    uint16  public feeBps;        // platform fee in basis points (max 100 = 1%)
    address public feeRecipient;

    event BatchExecuted(address indexed user, uint256 calls, uint256 feeTaken);
    event FeeUpdated(uint16 feeBps, address feeRecipient);
    event OwnerUpdated(address newOwner);

    error NotOwner();
    error CallFailed(uint256 index, bytes returnData);
    error LeftoverBalance(address token, uint256 amount);
    error FeeTooHigh();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "reentrant");
        _locked = true;
        _;
        _locked = false;
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer failed");
    }

    constructor(address _feeRecipient, uint16 _feeBps) {
        if (_feeBps > 100) revert FeeTooHigh();
        owner        = msg.sender;
        feeRecipient = _feeRecipient;
        feeBps       = _feeBps;
    }

    /**
     * Execute a sequence of calls in one transaction.
     * @param calls         Ordered list of low-level calls to make.
     * @param sweepTokens   Tokens to sweep back to msg.sender at the end.
     *                      Any non-zero leftover triggers a revert unless feeBps>0
     *                      (then the fee portion is forwarded to feeRecipient).
     */
    function executeBatch(Call[] calldata calls, address[] calldata sweepTokens)
        external
        payable
        nonReentrant
    {
        uint256 len = calls.length;
        for (uint256 i = 0; i < len; ++i) {
            (bool ok, bytes memory ret) = calls[i].target.call{value: calls[i].value}(calls[i].data);
            if (!ok) revert CallFailed(i, ret);
        }

        uint256 totalFee;
        for (uint256 i = 0; i < sweepTokens.length; ++i) {
            address token = sweepTokens[i];
            uint256 bal   = IERC20(token).balanceOf(address(this));
            if (bal == 0) continue;

            uint256 fee  = (bal * feeBps) / 10_000;
            uint256 net  = bal - fee;

            if (fee > 0) {
                _safeTransfer(token, feeRecipient, fee);
                totalFee += fee;
            }
            _safeTransfer(token, msg.sender, net);

            uint256 remaining = IERC20(token).balanceOf(address(this));
            if (remaining != 0) revert LeftoverBalance(token, remaining);
        }

        if (address(this).balance > 0) {
            (bool sent, ) = msg.sender.call{value: address(this).balance}("");
            require(sent, "native refund failed");
        }

        emit BatchExecuted(msg.sender, len, totalFee);
    }

    function setFee(uint16 _feeBps, address _feeRecipient) external onlyOwner {
        if (_feeBps > 100) revert FeeTooHigh();
        feeBps       = _feeBps;
        feeRecipient = _feeRecipient;
        emit FeeUpdated(_feeBps, _feeRecipient);
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
        emit OwnerUpdated(_owner);
    }

    function rescue(address token, uint256 amount, address to) external onlyOwner {
        if (token == address(0)) {
            (bool sent, ) = to.call{value: amount}("");
            require(sent, "rescue native failed");
        } else {
            _safeTransfer(token, to, amount);
        }
    }

    receive() external payable {}
}
