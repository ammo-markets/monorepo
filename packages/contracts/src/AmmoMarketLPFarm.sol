// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AmmoManager} from "./AmmoManager.sol";
import {IERC20} from "./interfaces/IERC20.sol";

/// @notice Equal-weight LP farming contract for per-caliber LP tokens
/// @dev Every active pool with stake receives the same share of emissions, regardless of TVL or staker count.
contract AmmoMarketLPFarm {
    struct PoolInfo {
        IERC20 stakingToken;
        bytes32 caliberId;
        uint256 totalStaked;
        uint256 lastRewardTime;
        uint256 accRewardPerShare;
        bool active;
    }

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    uint256 public constant ACC_REWARD_PRECISION = 1e18;

    AmmoManager public immutable manager;
    IERC20 public immutable rewardToken;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public immutable duration;
    uint256 public immutable startRewardPerDay;
    bool public farmingStarted;
    bool public farmShutdown;
    uint256 public shutdownTime;
    uint256 public rewardReserve;

    uint256 private _locked;

    PoolInfo[] public pools;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    mapping(address => bool) public isPoolToken;

    error NotOwner();
    error NotGuardian();
    error ZeroAddress();
    error InvalidAmount();
    error InvalidTime();
    error DuplicatePool();
    error InvalidPool();
    error PoolInactive();
    error FarmIsShutdown();
    error FarmNotShutdown();
    error FarmAlreadyShutdown();
    error InsufficientFunding();
    error InsufficientRecoverableRewards();
    error Reentrancy();

    event PoolAdded(uint256 indexed pid, bytes32 indexed caliberId, address indexed stakingToken);
    event PoolActiveUpdated(uint256 indexed pid, bool active);
    event Deposited(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvested(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 indexed pid, uint256 amount);
    event RewardsFunded(address indexed funder, uint256 amount);
    event FarmShutdown(uint256 timestamp);
    event RewardTokensRecovered(address indexed to, uint256 amount);

    modifier onlyOwner() {
        if (!manager.isOwner(msg.sender)) revert NotOwner();
        _;
    }

    modifier onlyGuardianOrOwner() {
        if (!manager.isOwner(msg.sender) && msg.sender != manager.guardian()) revert NotGuardian();
        _;
    }

    modifier nonReentrant() {
        if (_locked == 1) revert Reentrancy();
        _locked = 1;
        _;
        _locked = 0;
    }

    constructor(address manager_, address rewardToken_, uint256 duration_, uint256 startRewardPerDay_) {
        if (manager_ == address(0) || rewardToken_ == address(0)) revert ZeroAddress();
        if (duration_ == 0 || startRewardPerDay_ == 0) revert InvalidTime();

        manager = AmmoManager(manager_);
        rewardToken = IERC20(rewardToken_);
        duration = duration_;
        startRewardPerDay = startRewardPerDay_;
    }

    function poolLength() external view returns (uint256) {
        return pools.length;
    }

    function rewardablePoolCount() public view returns (uint256 count) {
        uint256 length = pools.length;
        for (uint256 pid = 0; pid < length; pid++) {
            PoolInfo memory pool = pools[pid];
            if (pool.active && pool.totalStaked > 0) {
                count++;
            }
        }
    }

    function addPool(bytes32 caliberId, address stakingToken) external onlyOwner returns (uint256 pid) {
        if (farmShutdown) revert FarmIsShutdown();
        if (stakingToken == address(0)) revert ZeroAddress();
        if (stakingToken == address(rewardToken)) revert InvalidPool();
        if (isPoolToken[stakingToken]) revert DuplicatePool();

        massUpdatePools();

        pid = pools.length;
        pools.push(
            PoolInfo({
                stakingToken: IERC20(stakingToken),
                caliberId: caliberId,
                totalStaked: 0,
                lastRewardTime: _lastRewardStart(),
                accRewardPerShare: 0,
                active: true
            })
        );

        isPoolToken[stakingToken] = true;

        emit PoolAdded(pid, caliberId, stakingToken);
    }

    /// @notice Disable or re-enable a pool. A disabled pool stops earning new rewards.
    /// @dev Pools with existing stake can be disabled, but deposits remain blocked until re-enabled.
    function setPoolActive(uint256 pid, bool active) external onlyOwner {
        if (farmShutdown) revert FarmIsShutdown();
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[pid];
        if (pool.active == active) return;

        massUpdatePools();

        pool.active = active;
        if (active) {
            pool.lastRewardTime = _lastRewardStart();
        }

        emit PoolActiveUpdated(pid, active);
    }

    function fundRewards(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        _safeTransferFrom(rewardToken, msg.sender, address(this), amount);
        emit RewardsFunded(msg.sender, amount);
    }

    function deposit(uint256 pid, uint256 amount) external nonReentrant {
        if (farmShutdown) revert FarmIsShutdown();
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[pid];
        if (!pool.active) revert PoolInactive();

        if (!farmingStarted) {
            if (amount == 0) revert InvalidAmount();
            if (rewardToken.balanceOf(address(this)) < totalProgramRewards()) revert InsufficientFunding();
            _startFarming();
        }

        if (amount > 0 && pool.totalStaked == 0) {
            massUpdatePools();
        } else {
            updatePool(pid);
        }

        UserInfo storage user = userInfo[pid][msg.sender];
        _harvest(pool, user, pid, msg.sender);

        if (amount > 0) {
            uint256 beforeBalance = pool.stakingToken.balanceOf(address(this));
            _safeTransferFrom(pool.stakingToken, msg.sender, address(this), amount);
            uint256 received = pool.stakingToken.balanceOf(address(this)) - beforeBalance;
            if (received == 0) revert InvalidAmount();

            user.amount += received;
            pool.totalStaked += received;
        }

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION;
        emit Deposited(msg.sender, pid, amount);
    }

    function withdraw(uint256 pid, uint256 amount) external nonReentrant {
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[pid];
        UserInfo storage user = userInfo[pid][msg.sender];
        if (amount > user.amount) revert InvalidAmount();

        updatePool(pid);
        _harvest(pool, user, pid, msg.sender);

        if (amount > 0 && amount == pool.totalStaked) {
            massUpdatePools();
        }

        if (amount > 0) {
            user.amount -= amount;
            pool.totalStaked -= amount;
            _safeTransfer(pool.stakingToken, msg.sender, amount);
        }

        user.rewardDebt = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION;
        emit Withdrawn(msg.sender, pid, amount);
    }

    function harvest(uint256 pid) external nonReentrant {
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        updatePool(pid);
        uint256 pending = _harvest(pool, user, pid, msg.sender);
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION;

        if (pending == 0) {
            emit Harvested(msg.sender, pid, 0);
        }
    }

    /// @notice Withdraw staked LP immediately and forfeit pending rewards.
    function emergencyWithdraw(uint256 pid) external nonReentrant {
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        updatePool(pid);

        uint256 amount = user.amount;
        if (amount > 0 && amount == pool.totalStaked) {
            massUpdatePools();
        }

        uint256 pending = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
        if (pending > 0) {
            rewardReserve -= pending;
        }

        user.amount = 0;
        user.rewardDebt = 0;
        pool.totalStaked -= amount;

        if (amount > 0) {
            _safeTransfer(pool.stakingToken, msg.sender, amount);
        }

        emit EmergencyWithdrawn(msg.sender, pid, amount);
    }

    /// @notice Rescue unrelated tokens accidentally sent to this contract.
    function recoverToken(address token, address to, uint256 amount) external onlyGuardianOrOwner nonReentrant {
        if (token == address(0) || to == address(0)) revert ZeroAddress();
        if (token == address(rewardToken) || isPoolToken[token]) revert InvalidPool();
        _safeTransfer(IERC20(token), to, amount);
    }

    /// @notice Permanently stop farming and checkpoint rewards accrued up to this timestamp.
    /// @dev Users can still harvest, withdraw, or emergency withdraw after shutdown.
    function shutdownFarm() external onlyOwner nonReentrant {
        if (farmShutdown) revert FarmAlreadyShutdown();

        massUpdatePools();
        farmShutdown = true;
        shutdownTime = block.timestamp;

        uint256 length = pools.length;
        for (uint256 pid = 0; pid < length; pid++) {
            if (pools[pid].active) {
                pools[pid].active = false;
                emit PoolActiveUpdated(pid, false);
            }
        }

        emit FarmShutdown(block.timestamp);
    }

    /// @notice Recover reward tokens not reserved for already-accrued user rewards.
    /// @dev LP tokens are never recoverable.
    function recoverUnreservedRewards(address to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (!farmShutdown) revert FarmNotShutdown();
        if (amount > recoverableRewardBalance()) revert InsufficientRecoverableRewards();
        _safeTransfer(rewardToken, to, amount);
        emit RewardTokensRecovered(to, amount);
    }

    function hasActivePools() public view returns (bool) {
        uint256 length = pools.length;
        for (uint256 pid = 0; pid < length; pid++) {
            if (pools[pid].active) return true;
        }
        return false;
    }

    function recoverableRewardBalance() public view returns (uint256) {
        uint256 balance = rewardToken.balanceOf(address(this));
        if (balance <= rewardReserve) return 0;
        return balance - rewardReserve;
    }

    function massUpdatePools() public {
        uint256 length = pools.length;
        for (uint256 pid = 0; pid < length; pid++) {
            updatePool(pid);
        }
    }

    function updatePool(uint256 pid) public {
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[pid];

        uint256 current = _lastRewardStart();
        if (current <= pool.lastRewardTime) return;

        if (!pool.active || pool.totalStaked == 0) {
            pool.lastRewardTime = current;
            return;
        }

        uint256 rewardableCount = rewardablePoolCount();
        if (rewardableCount == 0) {
            pool.lastRewardTime = current;
            return;
        }

        uint256 poolReward = _emitted(pool.lastRewardTime, current) / rewardableCount;
        rewardReserve += poolReward;
        pool.accRewardPerShare += (poolReward * ACC_REWARD_PRECISION) / pool.totalStaked;
        pool.lastRewardTime = current;
    }

    function pendingRewards(uint256 pid, address account) external view returns (uint256) {
        if (pid >= pools.length) revert InvalidPool();
        PoolInfo memory pool = pools[pid];
        UserInfo memory user = userInfo[pid][account];

        uint256 accRewardPerShare = pool.accRewardPerShare;
        uint256 current = _lastRewardStart();

        if (current > pool.lastRewardTime && pool.active && pool.totalStaked > 0) {
            uint256 rewardableCount = rewardablePoolCount();
            if (rewardableCount > 0) {
                uint256 poolReward = _emitted(pool.lastRewardTime, current) / rewardableCount;
                accRewardPerShare += (poolReward * ACC_REWARD_PRECISION) / pool.totalStaked;
            }
        }

        return (user.amount * accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
    }

    function emitted(uint256 from, uint256 to) external view returns (uint256) {
        return _emitted(from, to);
    }

    function totalProgramRewards() public view returns (uint256) {
        return (startRewardPerDay * duration) / (2 * 1 days);
    }

    function _startFarming() internal {
        farmingStarted = true;
        startTime = block.timestamp;
        endTime = block.timestamp + duration;

        uint256 length = pools.length;
        for (uint256 pid = 0; pid < length; pid++) {
            pools[pid].lastRewardTime = block.timestamp;
        }
    }

    function _harvest(PoolInfo storage pool, UserInfo storage user, uint256 pid, address to)
        internal
        returns (uint256 pending)
    {
        pending = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
        if (pending > 0) {
            rewardReserve -= pending;
            _safeTransfer(rewardToken, to, pending);
            emit Harvested(to, pid, pending);
        }
    }

    function _lastRewardStart() internal view returns (uint256) {
        if (!farmingStarted) return 0;
        if (block.timestamp > endTime) return endTime;
        return block.timestamp;
    }

    function _emitted(uint256 from, uint256 to) internal view returns (uint256) {
        if (!farmingStarted) return 0;
        if (to <= startTime || from >= endTime || to <= from) return 0;

        uint256 cappedFrom = from < startTime ? startTime : from;
        uint256 cappedTo = to > endTime ? endTime : to;
        if (cappedTo <= cappedFrom) return 0;

        uint256 x1 = cappedFrom - startTime;
        uint256 x2 = cappedTo - startTime;
        uint256 elapsed = x2 - x1;

        return (startRewardPerDay * elapsed * ((2 * duration) - x1 - x2)) / (2 * duration * 1 days);
    }

    function _safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool success, bytes memory data) =
            address(token).call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert InvalidAmount();
    }

    function _safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) =
            address(token).call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert InvalidAmount();
    }
}
