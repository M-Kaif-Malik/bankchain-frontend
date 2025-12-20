import { useEffect, useState } from "react";
import "./App.css";

import Layout from "./layout/Layout.jsx";
import { BalanceProvider } from "./contexts/BalanceContext";

import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import Transfer from "./components/Transfer";
import AdminAccounts from "./components/AdminAccounts";
import Cards from "./components/Cards";
import Loans from "./components/Loans";
import Audit from "./components/Audit";
import AdminLoans from "./components/AdminLoans";
import UserCards from "./components/UserCards";
import { getAccountsContract } from "./utils/contract";

export default function App() {
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activePage, setActivePage] = useState("accounts"); // "accounts" | "cards" | "loans" | "audit" | "admin"
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!account) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    const checkAdmin = async () => {
      try {
        const accountsContract = await getAccountsContract();
        const owner = await accountsContract.owner();
        if (!cancelled) {
          setIsAdmin(owner.toLowerCase() === account.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to check admin status:", err);
        if (!cancelled) {
          setIsAdmin(false);
        }
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [account]);

  const renderContent = () => {
    if (!account) {
      return <WalletConnect setAccount={setAccount} setAccounts={setAccounts} />;
    }

    if (activePage === "accounts") {
      return (
        <div className="page">
          <div className="grid-2">
            <div className="card panel neon-glow">
              <Dashboard />
            </div>
            <div className="card panel neon-glow">
              <Transfer accounts={accounts} currentAccount={account} />
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <div className="card panel neon-glow">
              <Deposit />
            </div>
            <div className="card panel neon-glow">
              <Withdraw />
            </div>
          </div>
        </div>
      );
    }

    if (activePage === "cards") {
      return (
        <div className="page">
          <div className="card panel neon-glow">
            <UserCards />
          </div>
        </div>
      );
    }

    if (activePage === "loans") {
      return (
        <div className="page">
          <div className="card panel neon-glow">
            <Loans />
          </div>
        </div>
      );
    }

    if (activePage === "audit") {
      return (
        <div className="page">
          <div className="card panel neon-glow">
            <Audit />
          </div>
        </div>
      );
    }

    if (activePage === "admin" && isAdmin) {
      return (
        <div className="page">
          <div className="card panel neon-glow">
            <AdminAccounts />
          </div>
          <div className="card panel neon-glow" style={{ marginTop: "1rem" }}>
            <Cards />
          </div>
          <div className="card panel neon-glow" style={{ marginTop: "1rem" }}>
            <AdminLoans />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <BalanceProvider>
      <Layout
      activePage={activePage}
      onChangePage={(page) => {
        if (page === "admin" && !isAdmin) return;
        setActivePage(page);
      }}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      account={account}
      isAdmin={isAdmin}
      >
      {renderContent()}
      </Layout>
    </BalanceProvider>
  );
}
