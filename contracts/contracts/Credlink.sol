// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Credlink is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    error Credlink__ZeroAmount();
    error Credlink__ZeroDuration();
    error Credlink__InsufficientLiquidity();
    error Credlink__CollateralTooLow();
    error Credlink__TransferFailed();
    error Credlink__Unauthorized();
    error Credlink__NotOwner();
    error Credlink__InvalidOwner();
    error Credlink__InvalidRatio();
    error Credlink__LoanNotFound();
    error Credlink__LoanNotEligibleForLiquidation();
    error Credlink__InsufficientTransferredValue();
    error Credlink__YouShouldNotSendXTZ();
    error Credlink__PaymentMismatch();
    error Credlink__RepaymentExceedsDebt();

    event LoanCreated(address indexed lender, address indexed token, uint256 amount);
    event LoanAccepted(
        address indexed borrower,
        address indexed lender,
        address indexed token,
        uint256 amount,
        address collateralToken,
        uint256 collateralAmount
    );
    event LoanRepaid(
        address indexed borrower,
        address indexed lender,
        address indexed token,
        uint256 amount
    );
    event CollateralReleased(
        address indexed borrower,
        address indexed collateralToken,
        uint256 amount
    );
    event LenderLiquidityUpdated(
        address indexed lender,
        address indexed token,
        uint256 availableAmount
    );
    event LoanBorrowed(
        address indexed borrower,
        address indexed lender,
        address indexed token,
        uint256 amount
    );
    event LiquidityWithdrawn(address indexed lender, address indexed token, uint256 amount);

    mapping(address => mapping(address => uint256)) public collateral;
    mapping(address => mapping(address => uint256)) public debt;
    mapping(address => mapping(address => uint256)) public liquidityPool;
    mapping(address => Loan[]) public activeLoans;
    mapping(address => bool) public autoRecycleOff;
    mapping(address borrower => mapping(address lender => mapping(address token => uint256 amount)))
        public debtBorrowerLenderToken;

    address public XTZERLINK_TESTNET_USDT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    uint256 public minCollateralRatio = 15000; // 150% in basis points

    struct Loan {
        address lender;
        address token;
        uint256 amount;
    }

    constructor() Ownable(msg.sender) {}

    function setAutoRecycle(bool enabled) external {
        autoRecycleOff[msg.sender] = enabled;
    }

    function createLoan(
        address token,
        uint256 amount,
        uint256 duration
    ) external payable nonReentrant {
        if (amount == 0) revert Credlink__ZeroAmount();
        if (duration == 0) revert Credlink__ZeroDuration();

        liquidityPool[msg.sender][token] += amount;

        if (token == address(0)) {
            if (msg.value != amount) revert Credlink__InsufficientTransferredValue();
        } else {
            if (msg.value != 0) revert Credlink__YouShouldNotSendXTZ();
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        emit LoanCreated(msg.sender, token, amount);
        emit LenderLiquidityUpdated(msg.sender, token, liquidityPool[msg.sender][token]);
    }

    function lockCollateral(
        address collateralToken,
        uint256 collateralAmount
    ) external payable nonReentrant {
        if (collateralAmount == 0) revert Credlink__ZeroAmount();

        collateral[msg.sender][collateralToken] += collateralAmount;

        if (collateralToken == address(0)) {
            if (msg.value != collateralAmount) revert Credlink__InsufficientTransferredValue();
        } else {
            if (msg.value != 0) revert Credlink__YouShouldNotSendXTZ();
            IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);
        }
    }

    function acceptLoan(address lender, address token, uint256 amount) external nonReentrant {
        if (amount == 0) revert Credlink__ZeroAmount();

        uint256 liquidity = liquidityPool[lender][token];
        if (liquidity < amount) revert Credlink__InsufficientLiquidity();

        uint256 requiredCollateral = (amount * minCollateralRatio) / 10000;
        uint256 currentCollateral = collateral[msg.sender][token];
        if (currentCollateral < requiredCollateral) revert Credlink__CollateralTooLow();

        liquidityPool[lender][token] -= amount;
        debt[msg.sender][token] += amount;
        debtBorrowerLenderToken[msg.sender][lender][token] += amount; // new

        activeLoans[msg.sender].push(Loan(lender, token, amount));

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            if (!IERC20(token).transfer(msg.sender, amount)) revert Credlink__TransferFailed();
        }

        emit LoanAccepted(msg.sender, lender, token, amount, token, currentCollateral);
        emit LenderLiquidityUpdated(lender, token, liquidityPool[lender][token]);
        emit LoanBorrowed(
            msg.sender,
            lender,
            token,
            debtBorrowerLenderToken[msg.sender][lender][token]
        );
    }

    function withdrawLiquidity(address token, uint256 amount) external nonReentrant {
        uint256 available = liquidityPool[msg.sender][token];
        if (amount == 0 || amount > available) revert Credlink__InsufficientLiquidity();

        liquidityPool[msg.sender][token] -= amount;

        if (token == address(0)) {
            (bool sent, ) = payable(msg.sender).call{value: amount}("");
            if (!sent) revert Credlink__TransferFailed();
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit LiquidityWithdrawn(msg.sender, token, amount);
        emit LenderLiquidityUpdated(msg.sender, token, liquidityPool[msg.sender][token]);
    }

    function getDebtForBorrowerLenderToken(
        address borrower,
        address lender,
        address token
    ) external view returns (uint256) {
        return debtBorrowerLenderToken[borrower][lender][token];
    }

    function payLoan(address token, address lender, uint256 amount) external payable nonReentrant {
        uint256 currentDebt = debt[msg.sender][token];
        if (currentDebt < amount) revert Credlink__RepaymentExceedsDebt();

        uint256 lenderDebt = debtBorrowerLenderToken[msg.sender][lender][token];
        if (lenderDebt < amount) revert Credlink__RepaymentExceedsDebt();

        // XTZ case
        if (token == address(0)) {
            if (msg.value != amount) revert Credlink__PaymentMismatch();

            if (autoRecycleOff[lender]) {
                (bool sent, ) = payable(lender).call{value: amount}("");
                if (!sent) revert Credlink__TransferFailed();
            } else {
                liquidityPool[lender][token] += amount;
                emit LenderLiquidityUpdated(lender, token, liquidityPool[lender][token]);
            }
        } else {
            if (msg.value != 0) revert Credlink__YouShouldNotSendXTZ();

            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

            if (autoRecycleOff[lender]) {
                IERC20(token).safeTransfer(lender, amount);
            } else {
                liquidityPool[lender][token] += amount;
                emit LenderLiquidityUpdated(lender, token, liquidityPool[lender][token]);
            }
        }

        // Update debts
        debt[msg.sender][token] -= amount;
        debtBorrowerLenderToken[msg.sender][lender][token] -= amount;

        // Optional: update activeLoans here too (if you want precise tracking)

        // Release collateral if fully repaid
        if (debt[msg.sender][token] == 0) {
            uint256 colAmount = collateral[msg.sender][token];
            collateral[msg.sender][token] = 0;

            if (token == address(0)) {
                (bool sentCol, ) = payable(msg.sender).call{value: colAmount}("");
                if (!sentCol) revert Credlink__TransferFailed();
            } else {
                IERC20(token).safeTransfer(msg.sender, colAmount);
            }

            emit CollateralReleased(msg.sender, token, colAmount);
        }

        emit LoanRepaid(msg.sender, lender, token, amount);
        emit LoanBorrowed(
            msg.sender,
            lender,
            token,
            debtBorrowerLenderToken[msg.sender][lender][token]
        );
    }

    function liquidate(address borrower, address token) external nonReentrant {
        uint256 userDebt = debt[borrower][token];
        if (userDebt == 0) revert Credlink__LoanNotFound();

        uint256 requiredCollateral = (userDebt * minCollateralRatio) / 10000;
        uint256 userCollateral = collateral[borrower][token];
        if (userCollateral >= requiredCollateral) revert Credlink__LoanNotEligibleForLiquidation();

        debt[borrower][token] = 0;
        collateral[borrower][token] = 0;

        if (token == address(0)) {
            payable(msg.sender).transfer(userCollateral);
        } else {
            IERC20(token).safeTransfer(msg.sender, userCollateral);
        }
    }

    function updateMinCollateralRatio(uint256 newRatio) external onlyOwner nonReentrant {
        if (newRatio < 10000) revert Credlink__InvalidRatio();
        minCollateralRatio = newRatio;
    }

    function setOwner(address newOwner) external onlyOwner nonReentrant {
        transferOwnership(newOwner);
    }

    function getUserBalance(address account, address token) public view returns (uint256) {
        if (token == address(0)) {
            return account.balance;
        } else {
            return IERC20(token).balanceOf(account);
        }
    }

    function getUserLoans(address borrower) external view returns (Loan[] memory) {
        return activeLoans[borrower];
    }

    function isUndercollateralized(address borrower, address token) public view returns (bool) {
        uint256 d = debt[borrower][token];
        uint256 c = collateral[borrower][token];
        return c < (d * minCollateralRatio) / 10000;
    }
}
