import { useEffect, useState } from "react";
import { getAccountsContract, getSigner } from "../utils/contract";
import { ethers } from "ethers";

export default function Dashboard() {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    async function loadBalance() {
      try {
        const signer = await getSigner();
        if (!signer) {
          console.error("No signer available when loading balance");
          setBalance("0");
          return;
        }
        const address = await signer.getAddress();

        // Derive bytes32 account id from the user's address
        const accountId = ethers.zeroPadValue(address.toLowerCase(), 32);

        const accounts = await getAccountsContract();
        const bal = await accounts.checkBalance(accountId);
        setBalance(ethers.formatEther(bal));
      } catch (error) {
        console.error("Error loading balance:", error);
        setBalance("0");
      }
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
