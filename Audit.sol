// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Audit is Ownable {

    constructor() Ownable(msg.sender) {}

    event AuditLog(string action, bytes32 accountId, uint256 amount, uint256 timestamp);

    function logAction(string memory action, bytes32 accountId, uint256 amount) external onlyOwner {
        emit AuditLog(action, accountId, amount, block.timestamp);
    }
}
