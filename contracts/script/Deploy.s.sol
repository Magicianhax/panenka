// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PenaltyMatch} from "../src/PenaltyMatch.sol";

contract Deploy is Script {
    function run() external returns (PenaltyMatch pm) {
        uint256 pk       = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");

        vm.startBroadcast(pk);
        pm = new PenaltyMatch(treasury);
        vm.stopBroadcast();

        console2.log("PenaltyMatch deployed:", address(pm));
        console2.log("Treasury:", treasury);
    }
}
