import { useEffect, useState } from "react";
import { getAccountsContract, getSigner, getAccountRegistryContract } from "../utils/contract";
import { ethers } from "ethers";

export default function Dashboard() {
  const [balance, setBalance] = useState("0");
  const [registryId, setRegistryId] = useState("");
  const [newRegistryId, setNewRegistryId] = useState("");
  const [registryStatus, setRegistryStatus] = useState("");

  useEffect(() => {
    async function loadBalance() {
      try {
        const signer = await getSigner();
        if (!signer) {
          console.error("No signer available when loading balance");
          setBalance("0");
          return;
        }
        // Use the registered AccountRegistry ID to determine which account to show
        const registry = await getAccountRegistryContract();
        const myId = await registry.getMyAccountId();

        if (!myId || myId.length === 0) {
          // No registered ID yet: show 0 but let the registry panel guide the user
          setBalance("0");
          return;
        }

        const wallet = await registry.resolveAccount(myId);

        // Derive bytes32 account id from the wallet linked to the registry id
        const accountId = ethers.zeroPadValue(wallet.toLowerCase(), 32);

        const accounts = await getAccountsContract();
        const bal = await accounts.checkBalance(accountId);
        setBalance(ethers.formatEther(bal));
      } catch (error) {
        console.error("Error loading balance:", error);
        setBalance("0");
      }
    }
    async function loadRegistryId() {
      try {
        const registry = await getAccountRegistryContract();
        const id = await registry.getMyAccountId();
        setRegistryId(id);
      } catch (error) {
        console.error("Error loading registry id:", error);
      }
    }

    loadBalance();
    loadRegistryId();
  }, []);

  const registerAccountId = async () => {
    try {
      setRegistryStatus("Registering account id...");
      const trimmed = newRegistryId.trim();
      if (!trimmed) {
        throw new Error("Account id cannot be empty");
      }
      const registry = await getAccountRegistryContract();
      const tx = await registry.registerAccount(trimmed);
      await tx.wait();
      setRegistryId(trimmed);
      setNewRegistryId("");
      setRegistryStatus("Account id registered successfully");
    } catch (error) {
      console.error("registerAccountId error:", error);
      setRegistryStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Account Balance</h2>
      <p>{balance} ETH</p>

      <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}>
        <h3>Account Registry</h3>
        <p style={{ fontSize: "0.9rem" }}>
          You must register an account ID here before you can use deposits, withdrawals, or loans.
        </p>
        <p>
          <strong>Current ID:</strong>{" "}
          {registryId ? registryId : "(not registered)"}
        </p>
        <input
          placeholder="Choose a unique account ID (e.g. user123)"
          value={newRegistryId}
          onChange={(e) => setNewRegistryId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={registerAccountId}>Register Account ID</button>
        {registryStatus && <p style={{ marginTop: "0.5rem" }}>{registryStatus}</p>}
      </div>
    </div>
  );
}
