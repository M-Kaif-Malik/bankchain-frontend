import { useState } from "react";
import { connectWallet } from "../utils/wallet";

export default function WalletConnect({ setAccount, setAccounts }) {
    const [showInfo, setShowInfo] = useState(false);

    const handleConnect = async () => {
        const accounts = await connectWallet();
        if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            if (setAccounts) setAccounts(accounts);
        }
    };

    return (
        <div className="connect-wrapper">
            <div className="connect-card appear">
                <h2 className="connect-title">Welcome to BankChain</h2>
                <p className="connect-subtitle">Connect your wallet to manage on-chain balances, cards, loans and audit logs — securely.</p>

                <div className="connect-actions">
                    <button
                        type="button"
                        aria-label="Connect wallet"
                        className="btn btn--primary btn--md"
                        onClick={handleConnect}
                        style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                    >
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V7Z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 9H17" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Connect Wallet
                    </button>

                    <button
                        type="button"
                        className="btn btn--ghost btn--md"
                        onClick={() => setShowInfo((s) => !s)}
                        aria-expanded={showInfo}
                    >
                        {showInfo ? "Hide details" : "Why connect?"}
                    </button>
                </div>

                {showInfo && (
                    <div className="connect-info">
                        <ul>
                            <li>View and manage your on-chain account balance without manual reloads.</li>
                            <li>Apply for loans and issue cards tied to your registered account ID.</li>
                            <li>Audit logs and transaction receipts are available for transparency.</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
