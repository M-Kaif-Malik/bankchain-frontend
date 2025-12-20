import { useState } from "react";
import { ethers } from "ethers";
import { getAccountsContract, getSigner, getAccountRegistryContract } from "../utils/contract";

export default function AdminAccounts() {
  const [registryId, setRegistryId] = useState("");
  const [status, setStatus] = useState("");

  const createAccountForUser = async () => {
    try {
      setStatus("Creating account...");

      const signer = await getSigner();
      const ownerAddress = await signer.getAddress();
      console.log("Admin (owner) address:", ownerAddress);

      const trimmedId = registryId.trim();
      if (!trimmedId) {
        throw new Error("Account ID cannot be empty");
      }

      // Resolve the registry account ID to a wallet address
      const registry = await getAccountRegistryContract();
      const userAddress = await registry.resolveAccount(trimmedId);

      if (!ethers.isAddress(userAddress) || userAddress === ethers.ZeroAddress) {
        throw new Error("No wallet found for this account ID");
      }

      // Derive the same bytes32 account id from the resolved wallet address
      const accountId = ethers.zeroPadValue(userAddress.toLowerCase(), 32);
      console.log("Derived accountId for user:", accountId);

      const accounts = await getAccountsContract();

      // Call createAccount as contract owner (onlyOwner enforced on-chain)
      const tx = await accounts.createAccount(accountId, userAddress);
      await tx.wait();

      setStatus(`Account created for account ID "${trimmedId}" (wallet ${userAddress}) with internal id ${accountId}`);
    } catch (error) {
      console.error("Admin createAccount error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>Admin: Create User Account</h2>
      <p>Connect MetaMask with the Accounts contract owner address to use this panel.</p>
      <input
        placeholder="User account ID (registered on Dashboard)"
        value={registryId}
        onChange={(e) => setRegistryId(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <button className="btn btn--primary btn--md" onClick={createAccountForUser}>Create Account</button>
      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
