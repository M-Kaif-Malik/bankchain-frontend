import { getAccountsContract, getSigner, getAccountRegistryContract } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";
import { ethers } from "ethers";
import { useState } from "react";
import { useBalance } from "../contexts/BalanceContext";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const { bump } = useBalance();

  const withdraw = async () => {
    try {
      setStatus("Sending withdrawal...");
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
      const tx = await accounts.withdraw(
        accountId,
        valueWei
      );
      await tx.wait();
      setStatus("Withdrawal successful");
      setAmount("");

      // best-effort audit log (will only succeed for Audit owner)
      await logAuditAction("Withdraw", accountId, valueWei);
      try { bump(); } catch (e) {}
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
      <button className="btn btn--primary btn--md" onClick={withdraw}>Withdraw</button>
    </div>
  );
}
