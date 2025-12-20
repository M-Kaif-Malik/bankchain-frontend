import { getAccountsContract, getSigner, getAccountRegistryContract } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";
import { ethers } from "ethers";
import { useState } from "react";
import { useBalance } from "../contexts/BalanceContext";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const { bump } = useBalance();

  const deposit = async () => {
    try {
      setStatus("Sending deposit...");
      const signer = await getSigner();

      // Require that the user has registered an account id in AccountRegistry
      const registry = await getAccountRegistryContract();
      const myId = await registry.getMyAccountId();
      if (!myId || myId.length === 0) {
        setStatus("Error: please register an account ID in the Dashboard first");
        return;
      }

      // Resolve the registered account ID to the underlying wallet and derive bytes32 id from that
      const wallet = await registry.resolveAccount(myId);
      const accountId = ethers.zeroPadValue(wallet.toLowerCase(), 32);

      const accounts = await getAccountsContract();

      const valueWei = ethers.parseEther(amount);
      const tx = await accounts.deposit(accountId, {
        value: valueWei,
      });
      await tx.wait();
      setStatus("Deposit successful");
      setAmount("");

      // best-effort audit log (will only succeed for Audit owner)
      await logAuditAction("Deposit", accountId, valueWei);
      // notify app to refresh balances
      try { bump(); } catch (e) {}
    } catch (error) {
      console.error("Deposit error:", error);
      alert("Deposit failed: " + error.message);
    }
  };

  return (
    <div>
      <h3>Deposit</h3>
      <input
        placeholder="ETH amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="btn btn--primary btn--md" onClick={deposit}>Deposit</button>
    </div>
  );
}
