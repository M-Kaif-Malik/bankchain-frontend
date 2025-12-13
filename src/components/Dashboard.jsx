import { useEffect, useState } from "react";
import { getAccountsContract } from "../utils/contract";
import { ethers } from "ethers";

export default function Dashboard() {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    async function loadBalance() {
      const accounts = await getAccountsContract();
      const bal = await accounts.getBalance();
      setBalance(ethers.formatEther(bal));
    }
    loadBalance();
  }, []);

  return (
    <div>
      <h2>Account Balance</h2>
      <p>{balance} ETH</p>
    </div>
  );
}
