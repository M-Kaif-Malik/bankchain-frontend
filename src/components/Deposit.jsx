import { getAccountsContract, getSigner } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";
import { ethers } from "ethers";
import { useState } from "react";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const deposit = async () => {
    try {
      setStatus("Sending deposit...");
      const signer = await getSigner();
      const address = await signer.getAddress();

      const accountId = ethers.zeroPadValue(address.toLowerCase(), 32);

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
      <button onClick={deposit}>Deposit</button>
    </div>
  );
}
