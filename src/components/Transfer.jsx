import { getAccountsContract, getAccountRegistryContract } from "../utils/contract";
import { ethers } from "ethers";
import { useState } from "react";

export default function Transfer() {
  const [customTo, setCustomTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const transfer = async () => {
    try {
      setStatus("Preparing transfer...");

      const registry = await getAccountRegistryContract();

      // FROM: use the caller's registered account ID
      const myId = await registry.getMyAccountId();
      if (!myId) throw new Error("Register your account ID first");

      const fromWallet = await registry.resolveAccount(myId);
      const fromId = ethers.zeroPadValue(fromWallet.toLowerCase(), 32);

      // TO: resolve recipient by registry ID (entered in the UI field)
      const toRegistryId = customTo.trim();
      if (!toRegistryId) throw new Error("Enter recipient account ID");

      const toWallet = await registry.resolveAccount(toRegistryId);
      if (!ethers.isAddress(toWallet) || toWallet === ethers.ZeroAddress) {
        throw new Error("Recipient account does not exist");
      }

      const toId = ethers.zeroPadValue(toWallet.toLowerCase(), 32);

      const accounts = await getAccountsContract();
      const tx = await accounts.transfer(fromId, toId, ethers.parseEther(amount));
      await tx.wait();

      setStatus("Transfer successful");
      setAmount("");
      setCustomTo("");
    } catch (error) {
      console.error("Transfer error:", error);
      setStatus("Transfer failed: " + error.message);
    }
  };

  return (
    <div>
      <h3>Transfer</h3>
      <p>Enter a recipient address</p>
      <input
        placeholder="Recipient account ID"
        value={customTo}
        onChange={(e) => setCustomTo(e.target.value)}
      />

      <input
        placeholder="ETH amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={transfer} disabled={!amount}>
        Send
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
