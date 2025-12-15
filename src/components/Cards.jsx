import { useState } from "react";
import { ethers } from "ethers";
import { getCardsContract, getSigner } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";

export default function Cards() {
  const [accountsAddress, setAccountsAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [cardId, setCardId] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [status, setStatus] = useState("");

  const setAccounts = async () => {
    try {
      setStatus("Setting Accounts contract on Cards...");
      const cards = await getCardsContract();
      if (!ethers.isAddress(accountsAddress)) {
        throw new Error("Invalid Accounts contract address");
      }
      const tx = await cards.setAccountsContract(accountsAddress);
      await tx.wait();
      setStatus(`Accounts contract set to ${accountsAddress}`);
    } catch (error) {
      console.error("setAccountsContract error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const issueCard = async () => {
    try {
      setStatus("Issuing card...");
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      // Derive the same bytes32 accountId from the user's address
      const accountId = ethers.zeroPadValue(userAddress.toLowerCase(), 32);

      const cards = await getCardsContract();
      const tx = await cards.issueCard(accountId);
      const receipt = await tx.wait();

      // CardIssued(uint256 indexed cardId, bytes32 accountId)
      const event = receipt.logs
        .map((log) => {
          try {
            return cards.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "CardIssued");

      const newCardId = event ? event.args.cardId.toString() : "(check tx)";
      setStatus(`Card issued for ${userAddress} with cardId ${newCardId}`);

      // best-effort audit log for card issuance (amount 0)
      await logAuditAction("CardIssued", accountId, 0n);
    } catch (error) {
      console.error("issueCard error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const blockCard = async () => {
    try {
      setStatus("Blocking card...");
      const cards = await getCardsContract();
      const id = BigInt(cardId);
      const tx = await cards.blockCard(id);
      await tx.wait();
      setStatus(`Card ${cardId} blocked`);

      // Lookup underlying accountId for this card and log audit event
      const cardInfo = await cards.cards(id);
      const accountId = cardInfo.accountId || cardInfo[0];
      await logAuditAction("CardBlocked", accountId, 0n);
    } catch (error) {
      console.error("blockCard error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const chargeCard = async () => {
    try {
      setStatus("Charging card...");
      const cards = await getCardsContract();
      const id = BigInt(cardId);
      const amountWei = ethers.parseEther(chargeAmount || "0");
      const tx = await cards.chargeCard(id, amountWei);
      await tx.wait();
      setStatus(`Charged card ${cardId} with ${chargeAmount} ETH`);

      // Lookup accountId and log charged amount
      const cardInfo = await cards.cards(id);
      const accountId = cardInfo.accountId || cardInfo[0];
      await logAuditAction("CardCharged", accountId, amountWei);
    } catch (error) {
      console.error("chargeCard error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>Cards Dashboard</h2>
      <p>Use this section as the bank admin (contract owner) to manage cards.</p>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Link Accounts Contract</h3>
        <input
          placeholder="Accounts contract address (0x...)"
          value={accountsAddress}
          onChange={(e) => setAccountsAddress(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={setAccounts}>Set Accounts Contract</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Issue Card</h3>
        <input
          placeholder="User wallet address (0x...)"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={issueCard}>Issue Card for User</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Block Card</h3>
        <input
          placeholder="Card ID"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={blockCard}>Block Card</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Charge Card</h3>
        <input
          placeholder="Card ID"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <input
          placeholder="Amount in ETH"
          value={chargeAmount}
          onChange={(e) => setChargeAmount(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={chargeCard}>Charge Card</button>
      </div>

      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
