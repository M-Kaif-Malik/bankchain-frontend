import TopBar from "./TopBar.jsx";
import Sidebar from "./Sidebar.jsx";

function Layout({ activePage, onChangePage, isSidebarOpen, onToggleSidebar, isAdmin, children, account }) {
  return (
    <div className="layout-root">
      <Sidebar activePage={activePage} onChange={onChangePage} isOpen={isSidebarOpen} isAdmin={isAdmin} />
      <div className="layout-main">
        <TopBar activePage={activePage} onToggleSidebar={onToggleSidebar} account={account} />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;


