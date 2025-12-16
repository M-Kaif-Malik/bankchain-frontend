// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccountRegistry {

    struct Account {
        address wallet;
        bool active;
    }

    mapping(string => Account) private accounts;
    mapping(address => string) private walletToAccount;

    event AccountRegistered(string accountId, address wallet);

    function registerAccount(string memory accountId) external {
        require(accounts[accountId].wallet == address(0), "Account exists");
        require(bytes(walletToAccount[msg.sender]).length == 0, "Wallet already linked");

        accounts[accountId] = Account(msg.sender, true);
        walletToAccount[msg.sender] = accountId;

        emit AccountRegistered(accountId, msg.sender);
    }

    function resolveAccount(string memory accountId) external view returns (address) {
        return accounts[accountId].wallet;
    }

    function getMyAccountId() external view returns (string memory) {
        return walletToAccount[msg.sender];
    }
}
