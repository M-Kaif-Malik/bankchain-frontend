import { useState } from "react";
import "./App.css";

import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import Transfer from "./components/Transfer";
import AdminAccounts from "./components/AdminAccounts";
import Cards from "./components/Cards";
import Loans from "./components/Loans";
import Audit from "./components/Audit";

export default function App() {
	const [account, setAccount] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [activePage, setActivePage] = useState("accounts"); // "accounts" | "cards" | "loans" | "audit" | "admin"

	const renderContent = () => {
		if (!account) {
			return <WalletConnect setAccount={setAccount} setAccounts={setAccounts} />;
		}

		if (activePage === "accounts") {
			return (
				<>
					<Dashboard />
					<Deposit />
					<Withdraw />
					<Transfer accounts={accounts} currentAccount={account} />
				</>
			);
		}

		if (activePage === "cards") {
			return <Cards />;
		}

		if (activePage === "loans") {
			return <Loans />;
		}

		if (activePage === "audit") {
			return <Audit />;
		}

		if (activePage === "admin") {
			return <AdminAccounts />;
		}

		return null;
	};

	return (
		<div className="app">
			<h1>🏦 BankChain</h1>

			{/* Top-level navigation once a wallet is connected */}
			{account && (
				<div style={{ marginBottom: "1rem" }}>
					<button
						onClick={() => setActivePage("accounts")}
						style={{
							marginRight: "0.5rem",
							fontWeight: activePage === "accounts" ? "bold" : "normal",
						}}
					>
						Accounts
					</button>
					<button
						onClick={() => setActivePage("cards")}
						style={{
							marginRight: "0.5rem",
							fontWeight: activePage === "cards" ? "bold" : "normal",
						}}
					>
						Cards
					</button>
					<button
						onClick={() => setActivePage("loans")}
						style={{
							marginRight: "0.5rem",
							fontWeight: activePage === "loans" ? "bold" : "normal",
						}}
					>
						Loans
					</button>
					<button
						onClick={() => setActivePage("audit")} 
						style={{
							marginRight: "0.5rem",
							fontWeight: activePage === "audit" ? "bold" : "normal",
						}}
					>
						Audit
					</button>
					<button
						onClick={() => setActivePage("admin")}
						style={{
							fontWeight: activePage === "admin" ? "bold" : "normal",
						}}
					>
						Admin
					</button>
				</div>
			)}

			{renderContent()}
		</div>
	);
}

