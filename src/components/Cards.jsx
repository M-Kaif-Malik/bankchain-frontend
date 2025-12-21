import { useState } from "react";
import { useBalance } from "../contexts/BalanceContext";
import { ethers } from "ethers";
import { getCardsContract, getSigner, getAccountRegistryContract } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";

export default function Cards() {
  const [registryId, setRegistryId] = useState("");
  const [cardId, setCardId] = useState("");
  // legacy single cardId kept for backward compatibility in case other code references it
  // but we use separate states below to avoid cross-writing between sections
  const [blockCardId, setBlockCardId] = useState("");
  const [status, setStatus] = useState("");
  const { bump } = useBalance();

  const setAccounts = async () => {
    try {
      setStatus("Setting Accounts contract on Cards...");
      const cards = await getCardsContract();
      const accountsAddress = import.meta.env.VITE_ACCOUNTS_ADDRESS;

      if (!accountsAddress || !ethers.isAddress(accountsAddress)) {
        throw new Error("Accounts contract address not configured. Please set VITE_ACCOUNTS_ADDRESS in your environment.");
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
      const trimmedId = registryId.trim();
      if (!trimmedId) {
        throw new Error("Account ID cannot be empty");
      }

      // Resolve the registry account ID to a wallet address
      const registry = await getAccountRegistryContract();
      const userAddress = await registry.resolveAccount(trimmedId);

      if (!ethers.isAddress(userAddress) || userAddress === ethers.ZeroAddress) {
        throw new Error("No wallet found for this account ID");
      }

      // Derive the same bytes32 accountId from the resolved wallet address
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
      const id = BigInt(blockCardId || cardId);
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

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>Cards Dashboard</h2>
      <p>Use this section as the bank admin (contract owner) to manage cards.</p>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Link Accounts Contract</h3>
        <p style={{ fontSize: "0.9rem" }}>
          Uses the configured VITE_ACCOUNTS_ADDRESS from the environment.
        </p>
        <button className="btn btn--secondary btn--md" onClick={setAccounts}>Set Accounts Contract from Config</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Issue Card</h3>
        <input
          placeholder="User account ID (registered on Dashboard)"
          value={registryId}
          onChange={(e) => setRegistryId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button className="btn btn--primary btn--md" onClick={issueCard}>Issue Card for User</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Block Card</h3>
          <input
            placeholder="Card ID"
            value={blockCardId}
            onChange={(e) => setBlockCardId(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button className="btn btn--primary btn--md" onClick={blockCard}>Block Card</button>
      </div>

      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
