// SPDX-License-Identifier: MIT
// Modified from OpenZeppelin Contracts (last updated v4.8.0) (security/PullPayment.sol)

pragma solidity ^0.8.0;

import "./Escrow.sol";

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Simple implementation of a
 * https://consensys.github.io/smart-contract-best-practices/development-recommendations/general/external-calls/#favor-pull-over-push-for-external-calls[pull-payment]
 * strategy, where the paying contract doesn't interact directly with the
 * receiver account, which must withdraw its payments itself.
 *
 * Pull-payments are often considered the best practice when it comes to sending
 * Ether, security-wise. It prevents recipients from blocking execution, and
 * eliminates reentrancy concerns.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * To use, derive from the `PullPayment` contract, and use {_asyncTransfer}
 * instead of Solidity's `transfer` function. Payees can query their due
 * payments with {payments}, and retrieve them with {withdrawPayments}.
 */
abstract contract PullPayment is Initializable {
    /// @custom:storage-location erc7201:0g.storage.PullPayment
    struct PullPaymentStorage {
        Escrow escrow;
    }

    // keccak256(abi.encode(uint(keccak256("0g.storage.PullPayment")) - 1)) & ~bytes32(uint(0xff))
    bytes32 private constant PullPaymentStorageLocation =
        0x18886ccf3cb33ec4f8e31fd4f09d61266d4695ceab87fb3d39636905b707c100;

    function _getPullPaymentStorage() private pure returns (PullPaymentStorage storage $) {
        assembly {
            $.slot := PullPaymentStorageLocation
        }
    }

    function __PullPayment_init() internal onlyInitializing {
        PullPaymentStorage storage $ = _getPullPaymentStorage();
        $.escrow = new Escrow();
    }

    function _escrow() internal view returns (Escrow) {
        PullPaymentStorage storage $ = _getPullPaymentStorage();
        return $.escrow;
    }

    /**
     * @dev Withdraw accumulated payments, forwarding all gas to the recipient.
     *
     * Note that _any_ account can call this function, not just the `payee`.
     * This means that contracts unaware of the `PullPayment` protocol can still
     * receive funds this way, by having a separate account call
     * {withdrawPayments}.
     *
     * WARNING: Forwarding all gas opens the door to reentrancy vulnerabilities.
     * Make sure you trust the recipient, or are either following the
     * checks-effects-interactions pattern or using {ReentrancyGuard}.
     *
     * @param payee Whose payments will be withdrawn.
     *
     * Causes the `escrow` to emit a {Withdrawn} event.
     */
    function withdrawPayments(address payable payee) public virtual {
        PullPaymentStorage storage $ = _getPullPaymentStorage();
        $.escrow.withdraw(payee);
    }

    /**
     * @dev Returns the payments owed to an address.
     * @param dest The creditor's address.
     */
    function payments(address dest) public view returns (uint) {
        PullPaymentStorage storage $ = _getPullPaymentStorage();
        return $.escrow.depositsOf(dest);
    }

    /**
     * @dev Called by the payer to store the sent amount as credit to be pulled.
     * Funds sent in this way are stored in an intermediate {Escrow} contract, so
     * there is no danger of them being spent before withdrawal.
     *
     * @param dest The destination address of the funds.
     * @param amount The amount to transfer.
     *
     * Causes the `escrow` to emit a {Deposited} event.
     */
    function _asyncTransfer(address dest, uint amount) internal virtual {
        PullPaymentStorage storage $ = _getPullPaymentStorage();
        $.escrow.deposit{value: amount}(dest);
    }
}
