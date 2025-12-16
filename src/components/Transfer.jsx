import { getAccountsContract, getSigner } from "../utils/contract";
import { ethers } from "ethers";
import { useState } from "react";

export default function Transfer() {
  const [customTo, setCustomTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const transfer = async () => {
    try {
      setStatus("Preparing transfer...");

      const signer = await getSigner();
      const fromAddress = await signer.getAddress();

      const toAddress = customTo;

      if (!toAddress) throw new Error("Enter a recipient address");
      if (!ethers.isAddress(toAddress)) throw new Error("Invalid recipient address");

      // Derive bytes32 account ids from wallet addresses (hidden from user)
      const fromId = ethers.zeroPadValue(fromAddress.toLowerCase(), 32);
      const toId = ethers.zeroPadValue(toAddress.toLowerCase(), 32);

      const accounts = await getAccountsContract();
      const tx = await accounts.transfer(
        fromId,
        toId,
        ethers.parseEther(amount)
      );
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
        placeholder="Recipient address (0x...)"
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
