// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAccounts {
    function accounts(bytes32 id) external view returns (address, uint256, bool);
    function withdraw(bytes32 id, uint256 amount) external;
}

contract Cards is Ownable {

    constructor() Ownable(msg.sender) {}

    IAccounts accountsContract;

    struct Card {
        bytes32 accountId;
        bool active;
    }

    mapping(uint256 => Card) public cards;
    uint256 public cardCounter;

    event CardIssued(uint256 indexed cardId, bytes32 accountId);
    event CardBlocked(uint256 indexed cardId);
    event CardCharged(uint256 indexed cardId, uint256 amount);

    function setAccountsContract(address accountsAddr) external onlyOwner {
        accountsContract = IAccounts(accountsAddr);
    }

    function issueCard(bytes32 accountId) external onlyOwner returns (uint256) {
        cardCounter++;
        cards[cardCounter] = Card(accountId, true);
        emit CardIssued(cardCounter, accountId);
        return cardCounter;
    }

    function blockCard(uint256 cardId) external onlyOwner {
        cards[cardId].active = false;
        emit CardBlocked(cardId);
    }

    function chargeCard(uint256 cardId, uint256 amount) external onlyOwner {
        require(cards[cardId].active, "Inactive");

        accountsContract.withdraw(cards[cardId].accountId, amount);

        emit CardCharged(cardId, amount);
    }
}
