function DrawerToggle({ onClick }) {
  return (
    <button className="drawer-toggle" onClick={onClick} aria-label="Toggle navigation">
      <span className="drawer-line" />
      <span className="drawer-line" />
    </button>
  );
}

export default DrawerToggle;


