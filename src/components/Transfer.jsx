import { getAccountsContract } from "../utils/contract";
import { ethers } from "ethers";
import { useState } from "react";

export default function Transfer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const transfer = async () => {
    const accounts = await getAccountsContract();
    const tx = await accounts.transfer(
      to,
      ethers.parseEther(amount)
    );
    await tx.wait();
    alert("Transfer Successful");
  };

  return (
    <div>
      <h3>Transfer</h3>
      <input
        placeholder="Recipient address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        placeholder="ETH amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={transfer}>Send</button>
    </div>
  );
}
