import DrawerToggle from "../components/DrawerToggle.jsx";

const pageTitles = {
  accounts: "Accounts",
  cards: "Cards",
  loans: "Loans",
  audit: "Audit Trail",
  admin: "Administration",
};

function TopBar({ activePage, onToggleSidebar }) {
  const title = pageTitles[activePage] ?? "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <DrawerToggle onClick={onToggleSidebar} />
        <div className="topbar-titles">
          <h1 className="topbar-title">{title}</h1>
          <p className="topbar-subtitle">On-chain balances, cards, loans, and audit.</p>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-wallet">
          <span className="wallet-label">Connected</span>
          <span className="wallet-address">MetaMask</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;


