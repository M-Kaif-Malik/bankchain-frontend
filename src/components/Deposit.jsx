import { getAccountsContract } from "../utils/contract";
import { ethers } from "ethers";
import { useState } from "react";

export default function Deposit() {
  const [amount, setAmount] = useState("");

  const deposit = async () => {
    const accounts = await getAccountsContract();
    const tx = await accounts.deposit({
      value: ethers.parseEther(amount),
    });
    await tx.wait();
    alert("Deposit Successful");
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
