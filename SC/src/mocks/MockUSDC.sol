// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Testnet-only mock of Circle's USD Coin with 6 decimals.
///         Unrestricted mint/burn functions are intentional for local and
///         testnet development — do NOT deploy to mainnet.
contract MockUSDC is ERC20, Ownable {
    // ─────────────────────────────── Errors ──────────────────────────────────

    /// @notice Thrown when burn is attempted on an address with insufficient balance.
    error MockUSDC__InsufficientBalance(address from, uint256 balance, uint256 amount);

    // ─────────────────────────────── Events ──────────────────────────────────

    /// @notice Emitted whenever new tokens are minted.
    /// @param to     Recipient address.
    /// @param amount Amount minted (6-decimal units).
    event Minted(address indexed to, uint256 amount);

    /// @notice Emitted whenever tokens are burned.
    /// @param from   Address whose tokens were burned.
    /// @param amount Amount burned (6-decimal units).
    event Burned(address indexed from, uint256 amount);

    // ──────────────────────────── Constructor ────────────────────────────────

    /// @notice Deploys MockUSDC and sets the deployer as initial owner.
    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {}

    // ─────────────────────────── View helpers ────────────────────────────────

    /// @notice Returns 6, matching real USDC precision.
    /// @return uint8 Decimal places.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // ──────────────────────────── State-changing ─────────────────────────────

    /// @notice Mints `amount` USDC to `to`. No access restriction (testnet only).
    /// @param to     Recipient address.
    /// @param amount Amount to mint in 6-decimal USDC units.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /// @notice Burns `amount` USDC from `from`. No access restriction (testnet only).
    /// @param from   Address to burn from.
    /// @param amount Amount to burn in 6-decimal USDC units.
    function burn(address from, uint256 amount) external {
        // Checks
        uint256 bal = balanceOf(from);
        if (bal < amount) revert MockUSDC__InsufficientBalance(from, bal, amount);

        // Effects + Interactions (ERC20._burn does state change internally)
        _burn(from, amount);
        emit Burned(from, amount);
    }
}
