import { getAccountsContract, getSigner } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";
import { ethers } from "ethers";
import { useState } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const withdraw = async () => {
    try {
      setStatus("Sending withdrawal...");
      const signer = await getSigner();
      const address = await signer.getAddress();

      const accountId = ethers.zeroPadValue(address.toLowerCase(), 32);

      const accounts = await getAccountsContract();
      const valueWei = ethers.parseEther(amount);
      const tx = await accounts.withdraw(
        accountId,
        valueWei
      );
      await tx.wait();
      setStatus("Withdrawal successful");
      setAmount("");

      // best-effort audit log (will only succeed for Audit owner)
      await logAuditAction("Withdraw", accountId, valueWei);
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Withdraw failed: " + error.message);
    }
  };

  return (
    <div>
      <h3>Withdraw</h3>
      <input
        placeholder="ETH amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={withdraw}>Withdraw</button>
    </div>
  );
}
