// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {DelegationVault} from "../src/DelegationVault.sol";
import {PlatformFee} from "../src/PlatformFee.sol";

/// @title Deploy
/// @notice Foundry deployment script for the full Hypervault contract suite on
///         Monad Testnet (chainId 10143).
///
///         Usage:
///           forge script script/Deploy.s.sol \
///             --rpc-url $MONAD_RPC_URL \
///             --broadcast \
///             --verify \
///             -vvvv
///
///         Required env vars:
///           PRIVATE_KEY         — deployer private key (hex, no 0x prefix required)
///           MONAD_RPC_URL       — https://testnet-rpc.monad.xyz
///           EXPLORER_API_KEY    — for --verify (optional on testnet)
contract Deploy is Script {
    // ──────────────────────────── Deployment state ───────────────────────────

    MockUSDC      public mockUSDC;
    AgentRegistry public agentRegistry;
    DelegationVault public delegationVault;
    PlatformFee   public platformFee;

    // ─────────────────────────────── Entry point ─────────────────────────────

    function run() external {
        // Load deployer key from environment.
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("=== Hypervault Deployment ===");
        console.log("Deployer      :", deployer);
        console.log("Chain ID      :", block.chainid);
        console.log("Block         :", block.number);
        console.log("Timestamp     :", block.timestamp);
        console.log("");

        vm.startBroadcast(deployerKey);

        // ── 1. MockUSDC ──────────────────────────────────────────────────────
        mockUSDC = new MockUSDC();
        console.log("MockUSDC      :", address(mockUSDC));

        // ── 2. AgentRegistry ─────────────────────────────────────────────────
        agentRegistry = new AgentRegistry();
        console.log("AgentRegistry :", address(agentRegistry));

        // ── 3. PlatformFee ───────────────────────────────────────────────────
        platformFee = new PlatformFee(address(mockUSDC));
        console.log("PlatformFee   :", address(platformFee));

        // ── 4. DelegationVault ───────────────────────────────────────────────
        delegationVault = new DelegationVault(
            address(mockUSDC),
            address(agentRegistry),
            address(platformFee)
        );
        console.log("DelegationVault:", address(delegationVault));

        // ── 5. Wire up cross-contract references ─────────────────────────────
        // Tell AgentRegistry which address is the authorised vault.
        agentRegistry.setDelegationVault(address(delegationVault));
        console.log("AgentRegistry.delegationVault set");

        // Authorise DelegationVault to charge fees on PlatformFee.
        platformFee.setAuthorisedCaller(address(delegationVault), true);
        console.log("PlatformFee authorised DelegationVault");

        vm.stopBroadcast();

        // ── 6. Print deployment summary ──────────────────────────────────────
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("{");
        console.log('  "network": "monad-testnet",');
        console.log('  "chainId": 10143,');
        console.log('  "contracts": {');
        console.log('    "MockUSDC":        "%s",', address(mockUSDC));
        console.log('    "AgentRegistry":   "%s",', address(agentRegistry));
        console.log('    "DelegationVault": "%s",', address(delegationVault));
        console.log('    "PlatformFee":     "%s"',  address(platformFee));
        console.log("  }");
        console.log("}");

        // ── 7. Persist deployment artifacts ──────────────────────────────────
        _writeDeploymentJson();
    }

    /// @notice Writes a JSON deployment artifact to `deployments/monad-testnet.json`.
    function _writeDeploymentJson() internal {
        string memory json = string.concat(
            '{\n',
            '  "network": "monad-testnet",\n',
            '  "chainId": 10143,\n',
            '  "contracts": {\n',
            '    "MockUSDC": "',        vm.toString(address(mockUSDC)),        '",\n',
            '    "AgentRegistry": "',   vm.toString(address(agentRegistry)),   '",\n',
            '    "DelegationVault": "', vm.toString(address(delegationVault)), '",\n',
            '    "PlatformFee": "',     vm.toString(address(platformFee)),     '"\n',
            '  }\n',
            '}\n'
        );

        // Ensure the output directory exists
        string memory root = vm.projectRoot();
        vm.createDir(string.concat(root, "/deployments"), true);
        vm.writeFile(string.concat(root, "/deployments/monad-testnet.json"), json);
        console.log("Deployment artifact written to deployments/monad-testnet.json");
    }
}
