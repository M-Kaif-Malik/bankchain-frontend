import { getAccountsContract, getSigner } from "../utils/contract";
import { ethers } from "ethers";
import { useState, useMemo } from "react";

export default function Transfer({ accounts = [], currentAccount }) {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  // Build a list of other wallets the user has exposed in MetaMask
  const otherAccounts = useMemo(
    () => accounts.filter((a) => a.toLowerCase() !== (currentAccount || "").toLowerCase()),
    [accounts, currentAccount]
  );

  const transfer = async () => {
    try {
      setStatus("Preparing transfer...");

      const signer = await getSigner();
      const fromAddress = await signer.getAddress();

      let toAddress = customTo;
      if (!toAddress && selectedAddress) {
        toAddress = selectedAddress;
      }

      if (!toAddress) throw new Error("Select a contact or enter a recipient address");
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
      setSelectedAddress("");
    } catch (error) {
      console.error("Transfer error:", error);
      setStatus("Transfer failed: " + error.message);
    }
  };

  return (
    <div>
      <h3>Transfer</h3>

      <label>My other MetaMask wallets</label>
      <select
        value={selectedAddress}
        onChange={(e) => setSelectedAddress(e.target.value)}
      >
        <option value="">-- Select wallet (optional) --</option>
        {otherAccounts.map((addr) => (
          <option key={addr} value={addr}>
            {addr}
          </option>
        ))}
      </select>

      <p>Or enter a recipient address manually</p>
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
