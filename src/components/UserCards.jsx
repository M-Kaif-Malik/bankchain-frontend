import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useBalance } from "../contexts/BalanceContext";
import { getCardsContract, getAccountRegistryContract } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";

export default function UserCards() {
  const [cardId, setCardId] = useState("");
  const [chargeCardId, setChargeCardId] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [status, setStatus] = useState("");
  const [myCards, setMyCards] = useState([]);
  const { bump } = useBalance();

  useEffect(() => {
    const loadMyCards = async () => {
      try {
        setStatus("Loading your cards...");

        const registry = await getAccountRegistryContract();
        const myId = await registry.getMyAccountId();
        if (!myId || myId.length === 0) {
          setMyCards([]);
          setStatus("No account ID registered. Register one on the Accounts page to use cards.");
          return;
        }

        const wallet = await registry.resolveAccount(myId);
        const accountId = ethers.zeroPadValue(wallet.toLowerCase(), 32);

        const cards = await getCardsContract();
        const total = await cards.cardCounter();

        const owned = [];
        for (let i = 1n; i <= total; i++) {
          const info = await cards.cards(i);
          const storedAccountId = info.accountId || info[0];
          const active = info.active ?? info[1];

          if (active && storedAccountId === accountId) {
            owned.push(i.toString());
          }
        }

        setMyCards(owned);
        setStatus(owned.length === 0 ? "You have no active cards yet." : "");
      } catch (error) {
        console.error("loadMyCards error:", error);
        setStatus(`Error loading cards: ${error.message}`);
      }
    };

    loadMyCards();
  }, []);

  const chargeCard = async () => {
    try {
      setStatus("Charging card...");
      const cards = await getCardsContract();
      const id = BigInt(chargeCardId || cardId);
      const amountWei = ethers.parseEther(chargeAmount || "0");

      const cardInfo = await cards.cards(id);
      const accountId = cardInfo.accountId || cardInfo[0];

      const tx = await cards.chargeCard(id, amountWei);
      await tx.wait();

      await logAuditAction("CardCharged", accountId, amountWei);
      setStatus(`Charged card ${id.toString()} with ${chargeAmount} ETH`);
      try { bump(); } catch (e) {}
    } catch (error) {
      console.error("chargeCard error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #222", borderRadius: 12, background: "#050509" }}>
      <h2>Cards</h2>
      <p>View the cards that are linked to your on-chain account.</p>

      <div style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
        <h3>Your Card IDs</h3>
        {myCards.length === 0 && (
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            You don&apos;t have any active cards yet. Once a card is issued for your
            account, it will appear here.
          </p>
        )}
        {myCards.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {myCards.map((id) => (
              <div
                key={id}
                style={{
                  padding: "0.75rem 0.9rem",
                  borderRadius: 10,
                  border: "1px solid #333",
                  background:
                    "radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 60%)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    opacity: 0.7,
                  }}
                >
                  Card ID
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>#{id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Charge Card</h3>
        <input
          placeholder="Card ID"
          value={chargeCardId}
          onChange={(e) => setChargeCardId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <input
          placeholder="Amount in ETH"
          value={chargeAmount}
          onChange={(e) => setChargeAmount(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button className="btn btn--primary btn--md" onClick={chargeCard}>Charge Card</button>
      </div>

      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
