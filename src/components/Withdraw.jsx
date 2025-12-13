import { getAccountsContract } from "../utils/contract";
import { ethers } from "ethers";
import { useState } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState("");

  const withdraw = async () => {
    const accounts = await getAccountsContract();
    const tx = await accounts.withdraw(
      ethers.parseEther(amount)
    );
    await tx.wait();
    alert("Withdraw Successful");
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
