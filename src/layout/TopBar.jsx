import DrawerToggle from "../components/DrawerToggle.jsx";

const pageTitles = {
  accounts: "Accounts",
  cards: "Cards",
  loans: "Loans",
  audit: "Audit Trail",
  admin: "Administration",
};

function TopBar({ activePage, onToggleSidebar, account }) {
  const title = pageTitles[activePage] ?? "Dashboard";

  const formatAddr = (a) => {
    if (!a) return null;
    try {
      const s = a.toString();
      return s.slice(0, 6) + "..." + s.slice(-4);
    } catch {
      return a;
    }
  };

  const walletLabel = account
    ? `Connected on ${formatAddr(account)} with MetaMask`
    : "Not connected";

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
          <span className="wallet-label">{account ? "Connected" : "Not connected"}</span>
          {account ? (
            <span className="wallet-address" title={account}>{formatAddr(account)} — MetaMask</span>
          ) : (
            <span className="wallet-address">MetaMask</span>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;


