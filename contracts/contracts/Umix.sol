// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Umix is Ownable {
    using SafeERC20 for IERC20;
    error Umix__ZeroAmount();
    error Umix__ZeroDuration();
    error Umix__InsufficientLiquidity();
    error Umix__CollateralTooLow();
    error Umix__TransferFailed();
    error Umix__Unauthorized();
    error Umix__NotOwner();
    error Umix__InvalidOwner();
    error Umix__InvalidRatio();
    error Umix__LoanNotFound();
    error Umix__LoanNotEligibleForLiquidation();
    error Umix__InsufficientTransferredValue();
    error Umix__YouShouldNotSendEth();
    error Umix__PaymentMismatch();
    error Umix__RepaymentExceedsDebt();

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

    mapping(address => mapping(address => uint256)) public collateral;
    mapping(address => mapping(address => uint256)) public debt;
    mapping(address => mapping(address => uint256)) public liquidityPool;
    mapping(address => Loan[]) public activeLoans;

    uint256 public minCollateralRatio = 15000; // 150% in basis points

    struct Loan {
        address lender;
        address token;
        uint256 amount;
    }

    constructor() Ownable(msg.sender) {}

    function createLoan(address token, uint256 amount, uint256 duration) external payable {
        if (amount == 0) revert Umix__ZeroAmount();
        if (duration == 0) revert Umix__ZeroDuration();

        liquidityPool[msg.sender][token] += amount;

        if (token == address(0)) {
            if (msg.value != amount) revert Umix__InsufficientTransferredValue();
        } else {
            if (msg.value != 0) revert Umix__YouShouldNotSendEth();
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        emit LoanCreated(msg.sender, token, amount);
    }

    function lockCollateral(address collateralToken, uint256 collateralAmount) external payable {
        if (collateralAmount == 0) revert Umix__ZeroAmount();

        collateral[msg.sender][collateralToken] += collateralAmount;

        if (collateralToken == address(0)) {
            if (msg.value != collateralAmount) revert Umix__InsufficientTransferredValue();
        } else {
            if (msg.value != 0) revert Umix__YouShouldNotSendEth();
            IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);
        }
    }

    function acceptLoan(address lender, address token, uint256 amount) external {
        if (amount == 0) revert Umix__ZeroAmount();

        uint256 liquidity = liquidityPool[lender][token];
        if (liquidity < amount) revert Umix__InsufficientLiquidity();

        uint256 requiredCollateral = (amount * minCollateralRatio) / 10000;
        uint256 currentCollateral = collateral[msg.sender][token];
        if (currentCollateral < requiredCollateral) revert Umix__CollateralTooLow();

        liquidityPool[lender][token] -= amount;
        debt[msg.sender][token] += amount;
        activeLoans[msg.sender].push(Loan(lender, token, amount));

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            if (!IERC20(token).transfer(msg.sender, amount)) revert Umix__TransferFailed();
        }

        emit LoanAccepted(msg.sender, lender, token, amount, token, currentCollateral);
    }

    function payLoan(address token, address lender, uint256 amount) external payable {
        uint256 currentDebt = debt[msg.sender][token];
        if (currentDebt < amount) revert Umix__RepaymentExceedsDebt();

        if (token == address(0)) {
            if (msg.value != amount) revert Umix__PaymentMismatch();
            payable(lender).transfer(amount);
        } else {
            if (msg.value != 0) revert Umix__YouShouldNotSendEth();
            IERC20(token).safeTransferFrom(msg.sender, lender, amount);
        }

        debt[msg.sender][token] -= amount;

        if (debt[msg.sender][token] == 0) {
            uint256 colAmount = collateral[msg.sender][token];
            collateral[msg.sender][token] = 0;

            if (token == address(0)) {
                payable(msg.sender).transfer(colAmount);
            } else {
                IERC20(token).safeTransfer(msg.sender, colAmount);
            }

            emit CollateralReleased(msg.sender, token, colAmount);
        }

        emit LoanRepaid(msg.sender, lender, token, amount);
    }

    function liquidate(address borrower, address token) external {
        uint256 userDebt = debt[borrower][token];
        if (userDebt == 0) revert Umix__LoanNotFound();

        uint256 requiredCollateral = (userDebt * minCollateralRatio) / 10000;
        uint256 userCollateral = collateral[borrower][token];
        if (userCollateral >= requiredCollateral) revert Umix__LoanNotEligibleForLiquidation();

        debt[borrower][token] = 0;
        collateral[borrower][token] = 0;

        if (token == address(0)) {
            payable(msg.sender).transfer(userCollateral);
        } else {
            IERC20(token).safeTransfer(msg.sender, userCollateral);
        }
    }

    function updateMinCollateralRatio(uint256 newRatio) external onlyOwner {
        if (newRatio < 10000) revert Umix__InvalidRatio();
        minCollateralRatio = newRatio;
    }

    function setOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
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
