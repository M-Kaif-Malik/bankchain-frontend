import { useState } from "react";
import { ethers } from "ethers";
import { getAccountsContract, getSigner } from "../utils/contract";

export default function AdminAccounts() {
  const [userAddress, setUserAddress] = useState("");
  const [status, setStatus] = useState("");

  const createAccountForUser = async () => {
    try {
      setStatus("Creating account...");

      const signer = await getSigner();
      const ownerAddress = await signer.getAddress();
      console.log("Admin (owner) address:", ownerAddress);

      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      // Derive the same bytes32 account id from the user's address
      const accountId = ethers.zeroPadValue(userAddress.toLowerCase(), 32);
      console.log("Derived accountId for user:", accountId);

      const accounts = await getAccountsContract();

      // Call createAccount as contract owner (onlyOwner enforced on-chain)
      const tx = await accounts.createAccount(accountId, userAddress);
      await tx.wait();

      setStatus(`Account created for ${userAddress} with id ${accountId}`);
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
        placeholder="User wallet address (0x...)"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <button onClick={createAccountForUser}>Create Account</button>
      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
