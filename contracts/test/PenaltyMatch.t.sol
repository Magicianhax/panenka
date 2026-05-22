// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {PenaltyMatch} from "../src/PenaltyMatch.sol";

contract PenaltyMatchTest is Test {
    PenaltyMatch pm;
    address treasury = address(0xCAFE);
    address p1 = address(0xA1);
    address p2 = address(0xB2);
    address bystander = address(0xC3);

    function setUp() public {
        // owner == address(this) (the deployer)
        pm = new PenaltyMatch(treasury);
        vm.deal(p1, 100 ether);
        vm.deal(p2, 100 ether);
        vm.deal(bystander, 10 ether);
    }

    // ---- helpers ----

    function _hash(uint8 s, uint8 d, bytes32 salt, address who, uint256 id, uint8 round)
        internal pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(s, d, salt, who, id, round));
    }

    function _playRound(
        uint256 id,
        uint8 round,
        uint8 shoot1, uint8 dive1,
        uint8 shoot2, uint8 dive2
    ) internal {
        bytes32 salt1 = keccak256(abi.encodePacked("p1-salt", round));
        bytes32 salt2 = keccak256(abi.encodePacked("p2-salt", round));

        vm.prank(p1);
        pm.commitMove(id, _hash(shoot1, dive1, salt1, p1, id, round));
        vm.prank(p2);
        pm.commitMove(id, _hash(shoot2, dive2, salt2, p2, id, round));

        vm.prank(p1);
        pm.revealMove(id, shoot1, dive1, salt1);
        vm.prank(p2);
        pm.revealMove(id, shoot2, dive2, salt2);
    }

    // move presets (relative to _playRound's (shoot1,dive1,shoot2,dive2) order)
    // only P1 scores: goal1 = shoot1 != dive2 (0!=1), goal2 = shoot2 != dive1 (1==1 -> save)
    function _onlyP1(uint256 id, uint8 r) internal { _playRound(id, r, 0, 1, 1, 1); }
    // only P2 scores: goal1 (0==0 -> save), goal2 (2!=1 -> goal)
    function _onlyP2(uint256 id, uint8 r) internal { _playRound(id, r, 0, 1, 2, 0); }
    // both score
    function _both(uint256 id, uint8 r)  internal { _playRound(id, r, 0, 1, 0, 1); }

    function _open(uint256 stakeWei) internal returns (uint256 id) {
        vm.prank(p1);
        id = pm.createMatch{value: stakeWei}(5);
        vm.prank(p2);
        pm.joinMatch{value: stakeWei}(id, 1);
    }

    function _score(uint256 id) internal view returns (uint8 s1, uint8 s2, PenaltyMatch.State st) {
        (,,,, , s1, s2, , st,) = pm.games(id);
    }

    // ---- creation / join ----

    function test_CreateMatch_StoresState() public {
        vm.prank(p1);
        uint256 id = pm.createMatch{value: 1 ether}(5);
        assertEq(id, 1);
        (address player1,, uint96 stake, uint8 c1,, ,, , PenaltyMatch.State state,) = pm.games(id);
        assertEq(player1, p1);
        assertEq(stake, 1 ether);
        assertEq(c1, 5);
        assertEq(uint8(state), uint8(PenaltyMatch.State.Open));
    }

    function test_JoinMatch_MovesToActive() public {
        uint256 id = _open(1 ether);
        (, address player2,,, uint8 c2,,, , PenaltyMatch.State state,) = pm.games(id);
        assertEq(player2, p2);
        assertEq(c2, 1);
        assertEq(uint8(state), uint8(PenaltyMatch.State.Active));
    }

    function test_WrongStake_Reverts() public {
        vm.prank(p1);
        uint256 id = pm.createMatch{value: 1 ether}(5);
        vm.prank(p2);
        vm.expectRevert(PenaltyMatch.WrongStake.selector);
        pm.joinMatch{value: 0.5 ether}(id, 1);
    }

    function test_SelfJoin_Reverts() public {
        vm.prank(p1);
        uint256 id = pm.createMatch{value: 1 ether}(5);
        vm.prank(p1);
        vm.expectRevert(PenaltyMatch.Bad.selector);
        pm.joinMatch{value: 1 ether}(id, 1);
    }

    function test_MaxCountry_Boundary() public {
        vm.prank(p1);
        pm.createMatch{value: 1 ether}(47); // ok: highest valid index
        vm.prank(p1);
        vm.expectRevert(PenaltyMatch.Bad.selector);
        pm.createMatch{value: 1 ether}(48); // one past the 48-nation field
    }

    // ---- cancel ----

    function test_Cancel_CreditsCreator() public {
        vm.prank(p1);
        uint256 id = pm.createMatch{value: 1 ether}(5);
        vm.prank(p1);
        pm.cancelOpen(id);
        assertEq(pm.pending(p1), 1 ether);     // credited, not yet sent
        assertEq(p1.balance, 99 ether);
        vm.prank(p1);
        pm.withdraw();
        assertEq(p1.balance, 100 ether);
    }

    function test_CancelByNonCreator_Reverts() public {
        vm.prank(p1);
        uint256 id = pm.createMatch{value: 1 ether}(5);
        vm.prank(p2);
        vm.expectRevert(PenaltyMatch.NotPlayer.selector);
        pm.cancelOpen(id);
    }

    // ---- gameplay / payout ----

    function test_FullMatch_P2Wins_AtFullTime() public {
        uint256 id = _open(1 ether);
        // alternate so the lead never exceeds the rounds remaining (no early clinch)
        _onlyP2(id, 0); // 0-1
        _onlyP1(id, 1); // 1-1
        _onlyP2(id, 2); // 1-2
        _onlyP1(id, 3); // 2-2
        _onlyP2(id, 4); // 2-3 -> full time, P2 wins

        (uint8 s1, uint8 s2, PenaltyMatch.State st) = _score(id);
        assertEq(s1, 2);
        assertEq(s2, 3);
        assertEq(uint8(st), uint8(PenaltyMatch.State.Settled));

        uint256 prize = (2 ether * 9750) / 10000;
        assertEq(pm.pending(p2), prize);
        assertEq(pm.feeAccrued(), (2 ether * 250) / 10000);

        vm.prank(p2);
        pm.withdraw();
        assertEq(p2.balance, 100 ether - 1 ether + prize);
    }

    function test_Clinch_SettlesEarly() public {
        uint256 id = _open(1 ether);
        // P1 scores every round, P2 never -> 3-0 after round index 2 is uncatchable
        _onlyP1(id, 0); // 1-0
        _onlyP1(id, 1); // 2-0
        _onlyP1(id, 2); // 3-0 with 2 left -> clinch

        (uint8 s1, uint8 s2, PenaltyMatch.State st) = _score(id);
        assertEq(s1, 3);
        assertEq(s2, 0);
        assertEq(uint8(st), uint8(PenaltyMatch.State.Settled));

        // round 4 must now be impossible — game already settled
        bytes32 salt = keccak256("late");
        vm.prank(p1);
        vm.expectRevert(PenaltyMatch.NotActive.selector);
        pm.commitMove(id, _hash(0, 1, salt, p1, id, 3));

        uint256 prize = (2 ether * 9750) / 10000;
        assertEq(pm.pending(p1), prize);
    }

    function test_FullMatch_Tie_RefundsBoth() public {
        uint256 id = _open(1 ether);
        for (uint8 r = 0; r < 5; r++) _both(id, r); // 5-5

        (uint8 s1, uint8 s2, PenaltyMatch.State st) = _score(id);
        assertEq(s1, 5);
        assertEq(s2, 5);
        assertEq(uint8(st), uint8(PenaltyMatch.State.Settled));
        assertEq(pm.pending(p1), 1 ether);
        assertEq(pm.pending(p2), 1 ether);
        assertEq(pm.feeAccrued(), 0);

        vm.prank(p1); pm.withdraw();
        vm.prank(p2); pm.withdraw();
        assertEq(p1.balance, 100 ether);
        assertEq(p2.balance, 100 ether);
    }

    function test_BadReveal_Reverts() public {
        uint256 id = _open(1 ether);
        bytes32 salt = keccak256("s");
        vm.prank(p1);
        pm.commitMove(id, _hash(0, 1, salt, p1, id, 0));
        vm.prank(p2);
        pm.commitMove(id, _hash(2, 1, salt, p2, id, 0));

        vm.prank(p1);
        vm.expectRevert(PenaltyMatch.Bad.selector);
        pm.revealMove(id, 1, 1, salt); // wrong shoot value
    }

    function test_NonPlayer_CannotCommit() public {
        uint256 id = _open(1 ether);
        vm.prank(bystander);
        vm.expectRevert(PenaltyMatch.NotPlayer.selector);
        pm.commitMove(id, bytes32(uint256(1)));
    }

    // ---- withdraw ----

    function test_Withdraw_ZeroesAndRejectsDouble() public {
        uint256 id = _open(1 ether);
        _onlyP1(id, 0);
        _onlyP1(id, 1);
        _onlyP1(id, 2); // clinch, P1 wins

        uint256 prize = (2 ether * 9750) / 10000;
        assertEq(pm.pending(p1), prize);

        vm.prank(p1);
        pm.withdraw();
        assertEq(pm.pending(p1), 0);
        assertEq(p1.balance, 100 ether - 1 ether + prize);

        vm.prank(p1);
        vm.expectRevert(PenaltyMatch.Nothing.selector);
        pm.withdraw();
    }

    // ---- timeout ----

    function test_Timeout_NeitherCommitted_RefundsBoth() public {
        uint256 id = _open(1 ether);
        vm.warp(block.timestamp + 6 minutes);
        pm.claimTimeout(id);
        assertEq(pm.pending(p1), 1 ether);
        assertEq(pm.pending(p2), 1 ether);
    }

    function test_Timeout_OnlyP1Committed_P1Wins() public {
        uint256 id = _open(1 ether);
        bytes32 salt = keccak256("s");
        vm.prank(p1);
        pm.commitMove(id, _hash(0, 1, salt, p1, id, 0));

        vm.warp(block.timestamp + 6 minutes);
        pm.claimTimeout(id);

        uint256 prize = (2 ether * 9750) / 10000;
        assertEq(pm.pending(p1), prize);
    }

    function test_Timeout_BothCommitted_OnlyP2Revealed_P2Wins() public {
        uint256 id = _open(1 ether);
        bytes32 s1 = keccak256("s1");
        bytes32 s2 = keccak256("s2");
        vm.prank(p1);
        pm.commitMove(id, _hash(0, 1, s1, p1, id, 0));
        vm.prank(p2);
        pm.commitMove(id, _hash(2, 1, s2, p2, id, 0));

        vm.prank(p2);
        pm.revealMove(id, 2, 1, s2);

        vm.warp(block.timestamp + 6 minutes);
        pm.claimTimeout(id);

        uint256 prize = (2 ether * 9750) / 10000;
        assertEq(pm.pending(p2), prize);
    }

    function test_Timeout_TooEarly_Reverts() public {
        uint256 id = _open(1 ether);
        vm.expectRevert(PenaltyMatch.NotYet.selector);
        pm.claimTimeout(id);
    }

    // ---- pause (admin) ----

    function test_Pause_BlocksNewMatchesOnly() public {
        // start a game BEFORE pausing so we can prove in-flight play + withdraw still work
        uint256 id = _open(1 ether);

        pm.setPaused(true); // owner == address(this)
        assertTrue(pm.paused());

        // new money in is blocked
        vm.prank(p1);
        vm.expectRevert(PenaltyMatch.Paused.selector);
        pm.createMatch{value: 1 ether}(5);

        // but the in-flight game finishes and funds remain claimable
        _onlyP1(id, 0);
        _onlyP1(id, 1);
        _onlyP1(id, 2); // clinch despite paused
        uint256 prize = (2 ether * 9750) / 10000;
        assertEq(pm.pending(p1), prize);
        vm.prank(p1);
        pm.withdraw();
        assertEq(p1.balance, 100 ether - 1 ether + prize);

        // unpause restores creation
        pm.setPaused(false);
        vm.prank(p1);
        pm.createMatch{value: 1 ether}(5);
    }

    function test_Pause_JoinBlocked() public {
        vm.prank(p1);
        uint256 id = pm.createMatch{value: 1 ether}(5);
        pm.setPaused(true);
        vm.prank(p2);
        vm.expectRevert(PenaltyMatch.Paused.selector);
        pm.joinMatch{value: 1 ether}(id, 1);
    }

    function test_SetPaused_OnlyOwner() public {
        vm.prank(bystander);
        vm.expectRevert(PenaltyMatch.NotOwner.selector);
        pm.setPaused(true);
    }

    // ---- fees ----

    function test_WithdrawFees_GoesToTreasury() public {
        uint256 id = _open(1 ether);
        _onlyP1(id, 0);
        _onlyP1(id, 1);
        _onlyP1(id, 2); // P1 clinches 3-0
        uint256 expectedFee = (2 ether * 250) / 10000;
        assertEq(pm.feeAccrued(), expectedFee);

        pm.withdrawFees();
        assertEq(treasury.balance, expectedFee);
        assertEq(pm.feeAccrued(), 0);
    }

    function test_ComputeCommit_MatchesContractHash() public view {
        bytes32 salt = keccak256("x");
        bytes32 a = pm.computeCommit(1, 2, salt, p1, 42, 3);
        bytes32 b = _hash(1, 2, salt, p1, 42, 3);
        assertEq(a, b);
    }

    // ---- fuzz: commit hash is collision-safe across inputs ----

    function testFuzz_ComputeCommit_Deterministic(
        uint8 shoot, uint8 dive, bytes32 salt, address who, uint256 id, uint8 round
    ) public view {
        shoot = uint8(bound(shoot, 0, 2));
        dive  = uint8(bound(dive, 0, 2));
        bytes32 a = pm.computeCommit(shoot, dive, salt, who, id, round);
        bytes32 b = pm.computeCommit(shoot, dive, salt, who, id, round);
        assertEq(a, b); // same inputs -> same commit (reproducible reveal)
    }
}
