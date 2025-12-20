import { createContext, useContext, useState } from "react";

const BalanceContext = createContext(null);

export function BalanceProvider({ children }) {
  const [version, setVersion] = useState(0);

  const bump = () => setVersion((v) => v + 1);

  return (
    <BalanceContext.Provider value={{ version, bump }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within BalanceProvider");
  return ctx;
}
