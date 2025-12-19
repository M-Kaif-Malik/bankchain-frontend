function Sidebar({ activePage, onChange, isOpen, isAdmin }) {
  const items = [
    { id: "accounts", label: "Accounts" },
    { id: "cards", label: "Cards" },
    { id: "loans", label: "Loans" },
    { id: "audit", label: "Audit" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <aside className={isOpen ? "sidebar sidebar-open" : "sidebar"}>
      <div className="sidebar-brand">
        <div className="sidebar-logo-mark" />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-title">BankChain</div>
          <div className="sidebar-brand-subtitle">On-chain banking</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items
          .filter((item) => (item.id === "admin" ? isAdmin : true))
          .map((item) => (
          <button
            key={item.id}
            className={
              activePage === item.id
                ? "sidebar-link sidebar-link-active"
                : "sidebar-link"
            }
            onClick={() => onChange(item.id)}
          >
            <span className="sidebar-link-label">{item.label}</span>
            {activePage === item.id && <span className="sidebar-link-indicator" />}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;


