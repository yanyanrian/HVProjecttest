// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IDelegationVault.sol";
import "./interfaces/IAgentRegistry.sol";
import "./interfaces/IPlatformFee.sol";

/// @title DelegationVault
/// @notice Manages USDC capital delegated to AI trading agents.
///
///         Profit accounting uses a MasterChef-style "reward per share" model:
///         - `accRewardPerShare` accumulates reward-per-principal-unit scaled by 1e12.
///         - On each deposit/withdraw/claim, pending rewards are settled via:
///             pending = (principal × accRewardPerShare / 1e12) − rewardDebt
///         - 80% of distributed profit goes to delegators pro-rata; 20% to the operator.
///
///         Security properties:
///         - Checks-Effects-Interactions on all state-changing paths.
///         - ReentrancyGuard on all external state-changing functions.
///         - SafeERC20 for all token transfers.
///         - No lockup: users may withdraw principal + claim rewards at any time.
contract DelegationVault is IDelegationVault, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─────────────────────────────── Constants ───────────────────────────────

    /// @notice Precision multiplier for accRewardPerShare arithmetic.
    uint256 private constant ACC_PRECISION = 1e12;

    /// @notice Delegator share of profits: 8000 / 10000 = 80%.
    uint256 private constant DELEGATOR_SHARE_BPS = 8000;

    /// @notice Operator share of profits: 2000 / 10000 = 20%.
    uint256 private constant OPERATOR_SHARE_BPS = 2000;

    /// @notice Basis-point denominator.
    uint256 private constant BPS_DENOM = 10_000;

    // ─────────────────────────────── Immutables ──────────────────────────────

    /// @notice USDC token used for all deposits, withdrawals, and rewards.
    IERC20 public immutable usdc;

    /// @notice Reference to the AgentRegistry for agent validation and callbacks.
    IAgentRegistry public immutable registry;

    /// @notice Reference to PlatformFee for per-trade fee collection.
    IPlatformFee public immutable platformFee;

    // ─────────────────────────────── State ───────────────────────────────────

    /// @notice agentId → pool state.
    mapping(uint256 => AgentPool) private _pools;

    /// @notice agentId → user address → delegator position.
    mapping(uint256 => mapping(address => DelegatorPosition)) private _positions;

    // ──────────────────────────── Constructor ────────────────────────────────

    /// @notice Deploys DelegationVault.
    /// @param _usdc        USDC token address.
    /// @param _registry    AgentRegistry address.
    /// @param _platformFee PlatformFee address.
    constructor(
        address _usdc,
        address _registry,
        address _platformFee
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        registry = IAgentRegistry(_registry);
        platformFee = IPlatformFee(_platformFee);
    }

    // ─────────────────────────────── Deposit ─────────────────────────────────

    /// @inheritdoc IDelegationVault
    function deposit(uint256 agentId, uint256 amount) external nonReentrant {
        // ── Checks ──────────────────────────────────────────────────────────
        if (amount == 0) revert DelegationVault__ZeroAmount();
        if (!registry.isAgentActive(agentId))
            revert DelegationVault__AgentNotActive(agentId);

        // ── Effects ─────────────────────────────────────────────────────────
        AgentPool storage pool = _pools[agentId];
        DelegatorPosition storage pos = _positions[agentId][msg.sender];

        // Settle any pending rewards BEFORE updating principal.
        // This ensures the user doesn't receive rewards on principal they haven't deposited yet.
        if (pos.principal > 0) {
            uint256 pending = _calcPending(pos, pool);
            if (pending > 0) {
                pos.pendingRewards += pending;
            }
        }

        // Update principal and rewardDebt.
        pos.principal += amount;
        pos.depositedAt = block.timestamp;
        // rewardDebt = new principal × accRewardPerShare / ACC_PRECISION
        pos.rewardDebt = (pos.principal * pool.accRewardPerShare) / ACC_PRECISION;

        pool.totalPrincipal += amount;

        // ── Interactions ─────────────────────────────────────────────────────
        // Pull USDC from caller (must have approved this contract).
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Notify registry so this address becomes eligible to submit reviews.
        registry.markAsDelegator(agentId, msg.sender);

        emit Deposited(agentId, msg.sender, amount);
    }

    // ─────────────────────────────── Withdraw ────────────────────────────────

    /// @inheritdoc IDelegationVault
    /// @dev On withdraw, a platform fee (bps from PlatformFee.feePercent) is
    ///      charged against the gross principal. The fee is pushed into the
    ///      PlatformFee contract via `chargeFee`; the delegator receives
    ///      `amount - feeAmount` + any harvested rewards.
    function withdraw(uint256 agentId, uint256 amount) external nonReentrant {
        // ── Checks ──────────────────────────────────────────────────────────
        if (amount == 0) revert DelegationVault__ZeroAmount();

        DelegatorPosition storage pos = _positions[agentId][msg.sender];

        if (pos.principal < amount)
            revert DelegationVault__InsufficientBalance(msg.sender, agentId, pos.principal, amount);

        // ── Effects ─────────────────────────────────────────────────────────
        AgentPool storage pool = _pools[agentId];

        // Settle pending rewards first (harvest-on-exit).
        uint256 pending = _calcPending(pos, pool);
        uint256 totalPendingRewards = pos.pendingRewards + pending;

        // Update principal and pool total.
        pos.principal -= amount;
        pool.totalPrincipal -= amount;

        // Recalculate rewardDebt for remaining principal.
        pos.rewardDebt = (pos.principal * pool.accRewardPerShare) / ACC_PRECISION;

        // Clear stored pending rewards (will be transferred below).
        pos.pendingRewards = 0;

        // ── Interactions ─────────────────────────────────────────────────────
        // Compute and collect the platform fee against the gross withdraw.
        uint256 feeAmount = platformFee.computeFee(amount);
        if (feeAmount > 0) {
            // Allow PlatformFee to pull `feeAmount` USDC from the vault.
            // forceApprove resets allowance to the exact value, avoiding the
            // non-zero → non-zero approval race on some ERC-20s.
            usdc.forceApprove(address(platformFee), feeAmount);
            platformFee.chargeFee(agentId, amount);
        }

        uint256 netAmount = amount - feeAmount;

        // Return principal net of the platform fee.
        if (netAmount > 0) {
            usdc.safeTransfer(msg.sender, netAmount);
        }

        // Pay out accumulated rewards in the same tx for UX convenience.
        if (totalPendingRewards > 0) {
            usdc.safeTransfer(msg.sender, totalPendingRewards);
            emit RewardsClaimed(agentId, msg.sender, totalPendingRewards);
        }

        emit WithdrawnWithFee(agentId, msg.sender, amount, feeAmount, netAmount);
        emit Withdrawn(agentId, msg.sender, amount);
    }

    // ────────────────────────── Profit Distribution ──────────────────────────

    /// @inheritdoc IDelegationVault
    function distributeProfits(uint256 agentId, uint256 amount)
        external
        nonReentrant
    {
        // ── Checks ──────────────────────────────────────────────────────────
        if (amount == 0) revert DelegationVault__ZeroAmount();

        // Only the agent's owner may call distributeProfits.
        IAgentRegistry.AgentInfo memory agentInfo = registry.getAgent(agentId);
        if (agentInfo.owner != msg.sender)
            revert DelegationVault__NotAgentOwner(msg.sender, agentId);

        // ── Effects ─────────────────────────────────────────────────────────
        AgentPool storage pool = _pools[agentId];

        // Compute 80/20 split.
        uint256 delegatorShare = (amount * DELEGATOR_SHARE_BPS) / BPS_DENOM;
        uint256 operatorShare = amount - delegatorShare; // Use subtraction to avoid rounding dust

        // Distribute delegator share via accRewardPerShare.
        // If no principal is staked, all profits accrue to the operator to avoid loss.
        if (pool.totalPrincipal > 0) {
            // Scale by ACC_PRECISION to preserve fractional rewards across participants.
            pool.accRewardPerShare += (delegatorShare * ACC_PRECISION) / pool.totalPrincipal;
        } else {
            // No delegators — fold delegator share into operator rewards.
            operatorShare = amount;
            delegatorShare = 0;
        }

        pool.operatorRewards += operatorShare;
        pool.totalDistributed += amount;

        // ── Interactions ─────────────────────────────────────────────────────
        // Pull profit USDC from agent operator (must have approved this contract).
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit ProfitsDistributed(agentId, amount, delegatorShare, operatorShare);
    }

    // ──────────────────────────── Claim Rewards ──────────────────────────────

    /// @inheritdoc IDelegationVault
    function claimRewards(uint256 agentId) external nonReentrant {
        // ── Checks + Effects ─────────────────────────────────────────────────
        AgentPool storage pool = _pools[agentId];
        DelegatorPosition storage pos = _positions[agentId][msg.sender];

        uint256 pending = _calcPending(pos, pool);
        uint256 total = pos.pendingRewards + pending;

        if (total == 0) revert DelegationVault__NoRewards(msg.sender, agentId);

        // Settle state before transferring.
        pos.rewardDebt = (pos.principal * pool.accRewardPerShare) / ACC_PRECISION;
        pos.pendingRewards = 0;

        // ── Interactions ─────────────────────────────────────────────────────
        usdc.safeTransfer(msg.sender, total);

        emit RewardsClaimed(agentId, msg.sender, total);
    }

    /// @inheritdoc IDelegationVault
    function claimOperatorRewards(uint256 agentId) external nonReentrant {
        // ── Checks ──────────────────────────────────────────────────────────
        IAgentRegistry.AgentInfo memory agentInfo = registry.getAgent(agentId);
        if (agentInfo.owner != msg.sender)
            revert DelegationVault__NotAgentOwner(msg.sender, agentId);

        AgentPool storage pool = _pools[agentId];
        uint256 amount = pool.operatorRewards;
        if (amount == 0) revert DelegationVault__NoOperatorRewards(agentId);

        // ── Effects ─────────────────────────────────────────────────────────
        pool.operatorRewards = 0;

        // ── Interactions ─────────────────────────────────────────────────────
        usdc.safeTransfer(msg.sender, amount);

        emit OperatorRewardsClaimed(agentId, msg.sender, amount);
    }

    // ─────────────────────────────── Views ───────────────────────────────────

    /// @inheritdoc IDelegationVault
    function getPosition(uint256 agentId, address user)
        external
        view
        returns (DelegatorPosition memory)
    {
        return _positions[agentId][user];
    }

    /// @inheritdoc IDelegationVault
    function getPool(uint256 agentId) external view returns (AgentPool memory) {
        return _pools[agentId];
    }

    /// @inheritdoc IDelegationVault
    function pendingReward(uint256 agentId, address user)
        external
        view
        returns (uint256)
    {
        AgentPool storage pool = _pools[agentId];
        DelegatorPosition storage pos = _positions[agentId][user];
        return pos.pendingRewards + _calcPending(pos, pool);
    }

    // ─────────────────────────── Internal helpers ─────────────────────────────

    /// @notice Computes the unsettled (newly accrued) pending reward for a position.
    /// @dev    Does NOT include `pos.pendingRewards` (already-stored rewards).
    /// @param pos   The delegator position to evaluate.
    /// @param pool  The corresponding agent pool.
    /// @return      Newly accrued USDC reward (not yet stored).
    function _calcPending(
        DelegatorPosition storage pos,
        AgentPool storage pool
    ) internal view returns (uint256) {
        // (principal × accRewardPerShare / ACC_PRECISION) − rewardDebt
        return (pos.principal * pool.accRewardPerShare) / ACC_PRECISION - pos.rewardDebt;
    }
}
