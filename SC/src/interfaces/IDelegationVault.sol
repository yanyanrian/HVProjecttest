// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IDelegationVault
/// @notice Interface for the DelegationVault contract that manages user capital
///         delegation to AI trading agents and profit distribution.
interface IDelegationVault {
    // ─────────────────────────────── Structs ─────────────────────────────────

    /// @notice Per-delegator position in an agent's pool.
    struct DelegatorPosition {
        uint256 principal;        // USDC deposited (6-decimal)
        uint256 rewardDebt;       // Reward debt used for reward accounting
        uint256 pendingRewards;   // Accumulated unclaimed USDC rewards
        uint256 depositedAt;      // Timestamp of most recent deposit
    }

    /// @notice Aggregate pool state for a single agent.
    struct AgentPool {
        uint256 totalPrincipal;   // Sum of all delegator principals
        uint256 accRewardPerShare; // Accumulated rewards per share, scaled by 1e12
        uint256 totalDistributed; // Lifetime rewards distributed to this pool
        uint256 operatorRewards;  // Unclaimed operator (agent owner) rewards
    }

    // ─────────────────────────────── Events ──────────────────────────────────

    /// @notice Emitted when a user deposits USDC into an agent pool.
    /// @param agentId  Target agent.
    /// @param user     Depositing address.
    /// @param amount   USDC amount deposited (6-decimal).
    event Deposited(uint256 indexed agentId, address indexed user, uint256 amount);

    /// @notice Emitted when a user withdraws principal from an agent pool.
    /// @param agentId  Target agent.
    /// @param user     Withdrawing address.
    /// @param amount   USDC gross amount withdrawn (6-decimal), before platform fee.
    event Withdrawn(uint256 indexed agentId, address indexed user, uint256 amount);

    /// @notice Emitted alongside `Withdrawn` with a breakdown of the platform fee
    ///         deducted from the user's gross withdrawal.
    /// @param agentId   Target agent.
    /// @param user      Withdrawing address.
    /// @param grossAmount Requested withdraw amount (pre-fee), in USDC 6-decimal.
    /// @param feeAmount   Platform fee charged, in USDC 6-decimal.
    /// @param netAmount   USDC actually sent to `user` (grossAmount - feeAmount).
    event WithdrawnWithFee(
        uint256 indexed agentId,
        address indexed user,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount
    );

    /// @notice Emitted when profits are distributed to a pool.
    /// @param agentId         Target agent.
    /// @param totalProfit     Total USDC profit distributed.
    /// @param delegatorShare  80% portion sent to delegators.
    /// @param operatorShare   20% portion sent to operator.
    event ProfitsDistributed(
        uint256 indexed agentId,
        uint256 totalProfit,
        uint256 delegatorShare,
        uint256 operatorShare
    );

    /// @notice Emitted when a delegator claims accumulated rewards.
    /// @param agentId  Agent pool rewards were claimed from.
    /// @param user     Claimant.
    /// @param amount   USDC rewards claimed.
    event RewardsClaimed(uint256 indexed agentId, address indexed user, uint256 amount);

    /// @notice Emitted when an agent operator claims their fee share.
    /// @param agentId  Agent pool.
    /// @param operator Operator address.
    /// @param amount   USDC claimed.
    event OperatorRewardsClaimed(uint256 indexed agentId, address indexed operator, uint256 amount);

    // ──────────────────────────────── Errors ─────────────────────────────────

    error DelegationVault__ZeroAmount();
    error DelegationVault__AgentNotActive(uint256 agentId);
    error DelegationVault__InsufficientBalance(address user, uint256 agentId, uint256 available, uint256 requested);
    error DelegationVault__NotAgentOwner(address caller, uint256 agentId);
    error DelegationVault__NoRewards(address user, uint256 agentId);
    error DelegationVault__NoOperatorRewards(uint256 agentId);
    error DelegationVault__TransferFailed();

    // ─────────────────────────────── Functions ───────────────────────────────

    /// @notice Deposits USDC into an agent's delegation pool.
    /// @param agentId  The agent to delegate to.
    /// @param amount   USDC amount to deposit (6-decimal).
    function deposit(uint256 agentId, uint256 amount) external;

    /// @notice Withdraws principal USDC from an agent's delegation pool.
    ///         Any pending rewards are automatically claimed on withdrawal.
    /// @param agentId  The agent pool to withdraw from.
    /// @param amount   USDC principal to withdraw (6-decimal).
    function withdraw(uint256 agentId, uint256 amount) external;

    /// @notice Distributes profits to an agent's pool.
    ///         80% goes to delegators (pro-rata by principal), 20% to operator.
    ///         Only callable by the agent's owner.
    /// @param agentId  The agent whose pool receives profits.
    /// @param amount   Total USDC profit to distribute.
    function distributeProfits(uint256 agentId, uint256 amount) external;

    /// @notice Claims all pending rewards for the caller in an agent's pool.
    /// @param agentId  The agent pool to claim from.
    function claimRewards(uint256 agentId) external;

    /// @notice Claims all pending operator rewards for an agent.
    ///         Only callable by the agent's owner.
    /// @param agentId  The agent pool to claim operator rewards from.
    function claimOperatorRewards(uint256 agentId) external;

    /// @notice Returns the delegator position for a user in an agent pool.
    /// @param agentId  Agent pool.
    /// @param user     Delegator address.
    /// @return         DelegatorPosition struct.
    function getPosition(uint256 agentId, address user)
        external
        view
        returns (DelegatorPosition memory);

    /// @notice Returns the aggregate pool state for an agent.
    /// @param agentId  Agent identifier.
    /// @return         AgentPool struct.
    function getPool(uint256 agentId) external view returns (AgentPool memory);

    /// @notice Returns the pending (unclaimed) reward for a user in a pool.
    /// @param agentId  Agent pool.
    /// @param user     Delegator address.
    /// @return         Pending USDC rewards.
    function pendingReward(uint256 agentId, address user) external view returns (uint256);
}
