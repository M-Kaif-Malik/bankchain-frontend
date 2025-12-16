// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Accounts is Ownable, ReentrancyGuard {

    constructor() Ownable(msg.sender) {}

    struct Account {
        address owner;
        uint256 balance;
        bool frozen;
    }

    mapping(bytes32 => Account) public accounts;

    event AccountCreated(bytes32 indexed id, address owner);
    event Deposit(bytes32 indexed id, uint256 amount);
    event Withdraw(bytes32 indexed id, uint256 amount);
    event Transfer(bytes32 indexed fromId, bytes32 indexed toId, uint256 amount);
    event Freeze(bytes32 indexed id, bool status);

    function createAccount(bytes32 id, address ownerAddr) external onlyOwner {
        require(accounts[id].owner == address(0), "Already exists");
        accounts[id] = Account(ownerAddr, 0, false);
        emit AccountCreated(id, ownerAddr);
    }

    function deposit(bytes32 id) external payable nonReentrant {
        require(!accounts[id].frozen, "Frozen");
        accounts[id].balance += msg.value;
        emit Deposit(id, msg.value);
    }

    function withdraw(bytes32 id, uint256 amount) external nonReentrant {
        Account storage acc = accounts[id];
        require(msg.sender == acc.owner, "Not owner");
        require(!acc.frozen, "Frozen");
        require(acc.balance >= amount, "Insufficient");
        acc.balance -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdraw(id, amount);
    }

    function transfer(bytes32 fromId, bytes32 toId, uint256 amount) external nonReentrant {
        Account storage senderAcc = accounts[fromId];
        Account storage receiverAcc = accounts[toId];

        require(msg.sender == senderAcc.owner, "Not owner");
        require(!senderAcc.frozen, "Frozen");
        require(!receiverAcc.frozen, "Receiver frozen");
        require(senderAcc.balance >= amount, "Insufficient");

        senderAcc.balance -= amount;
        receiverAcc.balance += amount;

        emit Transfer(fromId, toId, amount);
    }

    function freeze(bytes32 id, bool status) external onlyOwner {
        accounts[id].frozen = status;
        emit Freeze(id, status);
    }

    function checkBalance(bytes32 id) external view returns (uint256) {
        return accounts[id].balance;
    }
}
