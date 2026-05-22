// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PenaltyMatch
/// @notice 1v1 penalty shootout wager on X Layer. Native OKB stakes, commit-reveal, 5 rounds.
/// @dev    Each round both players simultaneously commit `keccak256(shoot, dive, salt, msg.sender, id, round)`,
///         then reveal. P1 scores when shoot1 != dive2; P2 scores when shoot2 != dive1.
///         Winner takes pot minus 2.5% fee. Tie -> both refunded.
///
///         Payouts use a PULL model: winnings, refunds and cancellations are credited to
///         `pending[player]`, which the player claims via `withdraw()`. This isolates transfer
///         failures (one un-payable address can never block another player or lock a game) and
///         lets a player recover a forgotten payout at any time.
///
///         A match settles early ("clinch") the moment a lead becomes mathematically
///         insurmountable, instead of always playing the full five rounds.
contract PenaltyMatch {
    // --- constants ---
    uint8  public constant TOTAL_ROUNDS  = 5;
    uint64 public constant REVEAL_WINDOW = 60 seconds;
    uint16 public constant FEE_BPS       = 250;       // 2.5%
    uint16 public constant BPS_DENOM     = 10_000;
    uint8  public constant MAX_COUNTRY   = 47;        // 48 nations (indices 0..47), matches the UI

    // --- types ---
    enum State { None, Open, Active, Settled, Cancelled }

    struct Round {
        bytes32 commit1;
        bytes32 commit2;
        uint8   shoot1;
        uint8   dive1;
        uint8   shoot2;
        uint8   dive2;
        bool    revealed1;
        bool    revealed2;
    }

    struct Game {
        address player1;
        address player2;
        uint96  stake;
        uint8   country1;
        uint8   country2;
        uint8   score1;
        uint8   score2;
        uint8   currentRound;
        State   state;
        uint64  lastActionAt;
    }

    // --- storage ---
    mapping(uint256 => Game)                     public games;
    mapping(uint256 => mapping(uint8 => Round))  private _rounds;
    mapping(address => uint256)                  public pending;   // claimable balance (pull-payment)
    uint256 public nextId = 1;
    address public immutable treasury;
    address public immutable owner;     // may pause new matches only; cannot touch funds
    uint256 public feeAccrued;
    bool    public paused;

    // --- errors ---
    error Bad();
    error NotOpen();
    error NotActive();
    error NotPlayer();
    error WrongStake();
    error AlreadyDone();
    error NotYet();
    error TransferFailed();
    error Paused();
    error NotOwner();
    error Nothing();

    // --- events ---
    event Created(uint256 indexed id, address indexed p1, uint8 country, uint96 stake);
    event Joined(uint256 indexed id, address indexed p2, uint8 country);
    event Cancelled(uint256 indexed id);
    event Commit(uint256 indexed id, uint8 round, address indexed player);
    event Reveal(uint256 indexed id, uint8 round, address indexed player, uint8 shoot, uint8 dive);
    event RoundDone(uint256 indexed id, uint8 round, bool goal1, bool goal2, uint8 score1, uint8 score2);
    event Settled(uint256 indexed id, address indexed winner, uint256 payout);
    event Credited(address indexed who, uint256 amount);
    event Claimed(address indexed who, uint256 amount);
    event FeeWithdrawn(uint256 amount);
    event PausedSet(bool paused);

    constructor(address _treasury) {
        if (_treasury == address(0)) revert Bad();
        treasury = _treasury;
        owner    = msg.sender;
    }

    // ============================================================
    // Match lifecycle
    // ============================================================

    function createMatch(uint8 country) external payable returns (uint256 id) {
        if (paused) revert Paused();
        if (msg.value == 0 || msg.value > type(uint96).max) revert Bad();
        if (country > MAX_COUNTRY) revert Bad();
        id = nextId++;
        Game storage g = games[id];
        g.player1      = msg.sender;
        g.country1     = country;
        g.stake        = uint96(msg.value);
        g.state        = State.Open;
        g.lastActionAt = uint64(block.timestamp);
        emit Created(id, msg.sender, country, uint96(msg.value));
    }

    function joinMatch(uint256 id, uint8 country) external payable {
        if (paused) revert Paused();
        Game storage g = games[id];
        if (g.state != State.Open) revert NotOpen();
        if (msg.value != g.stake) revert WrongStake();
        if (msg.sender == g.player1) revert Bad();
        if (country > MAX_COUNTRY) revert Bad();
        g.player2      = msg.sender;
        g.country2     = country;
        g.state        = State.Active;
        g.lastActionAt = uint64(block.timestamp);
        emit Joined(id, msg.sender, country);
    }

    function cancelOpen(uint256 id) external {
        Game storage g = games[id];
        if (g.state != State.Open) revert NotOpen();
        if (msg.sender != g.player1) revert NotPlayer();
        g.state = State.Cancelled;
        _credit(g.player1, g.stake);
        emit Cancelled(id);
    }

    // ============================================================
    // Commit-reveal
    // ============================================================

    function commitMove(uint256 id, bytes32 hash_) external {
        Game storage g = games[id];
        if (g.state != State.Active) revert NotActive();
        Round storage r = _rounds[id][g.currentRound];
        if (msg.sender == g.player1) {
            if (r.commit1 != bytes32(0)) revert AlreadyDone();
            r.commit1 = hash_;
        } else if (msg.sender == g.player2) {
            if (r.commit2 != bytes32(0)) revert AlreadyDone();
            r.commit2 = hash_;
        } else {
            revert NotPlayer();
        }
        g.lastActionAt = uint64(block.timestamp);
        emit Commit(id, g.currentRound, msg.sender);
    }

    function revealMove(uint256 id, uint8 shoot, uint8 dive, bytes32 salt) external {
        Game storage g = games[id];
        if (g.state != State.Active) revert NotActive();
        if (shoot > 2 || dive > 2) revert Bad();
        Round storage r = _rounds[id][g.currentRound];
        if (r.commit1 == bytes32(0) || r.commit2 == bytes32(0)) revert NotYet();

        bytes32 expected = keccak256(
            abi.encodePacked(shoot, dive, salt, msg.sender, id, g.currentRound)
        );

        if (msg.sender == g.player1) {
            if (r.revealed1) revert AlreadyDone();
            if (r.commit1 != expected) revert Bad();
            r.shoot1 = shoot;
            r.dive1  = dive;
            r.revealed1 = true;
        } else if (msg.sender == g.player2) {
            if (r.revealed2) revert AlreadyDone();
            if (r.commit2 != expected) revert Bad();
            r.shoot2 = shoot;
            r.dive2  = dive;
            r.revealed2 = true;
        } else {
            revert NotPlayer();
        }
        g.lastActionAt = uint64(block.timestamp);
        emit Reveal(id, g.currentRound, msg.sender, shoot, dive);

        if (r.revealed1 && r.revealed2) {
            _resolveRound(id);
        }
    }

    /// @notice After REVEAL_WINDOW seconds of no progress, the non-stalling player can claim.
    /// @dev    If only one committed, that player wins. If both committed but only one revealed,
    ///         the revealer wins. If neither committed, both refunded.
    function claimTimeout(uint256 id) external {
        Game storage g = games[id];
        if (g.state != State.Active) revert NotActive();
        if (block.timestamp < uint256(g.lastActionAt) + REVEAL_WINDOW) revert NotYet();
        Round storage r = _rounds[id][g.currentRound];

        bool c1 = r.commit1 != bytes32(0);
        bool c2 = r.commit2 != bytes32(0);

        if (!c1 && !c2) {
            _refundBoth(id, g);
            return;
        }
        if (c1 && !c2) { _payout(id, g, g.player1); return; }
        if (c2 && !c1) { _payout(id, g, g.player2); return; }

        // both committed
        if (r.revealed1 && !r.revealed2) { _payout(id, g, g.player1); return; }
        if (r.revealed2 && !r.revealed1) { _payout(id, g, g.player2); return; }

        // both committed, neither revealed -> refund
        _refundBoth(id, g);
    }

    // ============================================================
    // Withdrawals (pull-payment)
    // ============================================================

    /// @notice Claim any OKB owed to you — winnings, end-game refunds, or cancelled-match stakes.
    function withdraw() external {
        uint256 amt = pending[msg.sender];
        if (amt == 0) revert Nothing();
        pending[msg.sender] = 0;
        _send(msg.sender, amt);
        emit Claimed(msg.sender, amt);
    }

    // ============================================================
    // Internal
    // ============================================================

    function _resolveRound(uint256 id) internal {
        Game storage g = games[id];
        Round storage r = _rounds[id][g.currentRound];
        bool goal1 = r.shoot1 != r.dive2;
        bool goal2 = r.shoot2 != r.dive1;
        unchecked {
            if (goal1) g.score1++;
            if (goal2) g.score2++;
        }
        emit RoundDone(id, g.currentRound, goal1, goal2, g.score1, g.score2);

        g.currentRound++;
        g.lastActionAt = uint64(block.timestamp);

        uint8 remaining = TOTAL_ROUNDS - g.currentRound;

        if (g.currentRound == TOTAL_ROUNDS) {
            // full time
            if (g.score1 > g.score2)      _payout(id, g, g.player1);
            else if (g.score2 > g.score1) _payout(id, g, g.player2);
            else                          _refundBoth(id, g);
        } else if (g.score1 > g.score2 && g.score1 - g.score2 > remaining) {
            // P1's lead can no longer be caught — clinch
            _payout(id, g, g.player1);
        } else if (g.score2 > g.score1 && g.score2 - g.score1 > remaining) {
            _payout(id, g, g.player2);
        }
    }

    function _payout(uint256 id, Game storage g, address winner) internal {
        g.state = State.Settled;
        uint256 pot   = uint256(g.stake) * 2;
        uint256 fee   = (pot * FEE_BPS) / BPS_DENOM;
        uint256 prize = pot - fee;
        feeAccrued   += fee;
        _credit(winner, prize);
        emit Settled(id, winner, prize);
    }

    function _refundBoth(uint256 id, Game storage g) internal {
        g.state = State.Settled;
        uint256 refund = g.stake;
        _credit(g.player1, refund);
        _credit(g.player2, refund);
        emit Settled(id, address(0), 0);
    }

    function _credit(address to, uint256 amt) internal {
        if (amt == 0) return;
        pending[to] += amt;
        emit Credited(to, amt);
    }

    function _send(address to, uint256 amt) internal {
        (bool ok,) = to.call{value: amt}("");
        if (!ok) revert TransferFailed();
    }

    // ============================================================
    // Admin (pause new matches only — never touches player funds)
    // ============================================================

    function setPaused(bool p) external {
        if (msg.sender != owner) revert NotOwner();
        paused = p;
        emit PausedSet(p);
    }

    // ============================================================
    // Treasury
    // ============================================================

    function withdrawFees() external {
        uint256 amt = feeAccrued;
        if (amt == 0) return;
        feeAccrued = 0;
        _send(treasury, amt);
        emit FeeWithdrawn(amt);
    }

    // ============================================================
    // View
    // ============================================================

    function getRound(uint256 id, uint8 round) external view returns (Round memory) {
        return _rounds[id][round];
    }

    /// @notice Helper for clients to compute commit hash deterministically.
    function computeCommit(
        uint8 shoot,
        uint8 dive,
        bytes32 salt,
        address sender,
        uint256 id,
        uint8 round
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(shoot, dive, salt, sender, id, round));
    }
}
