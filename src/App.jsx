import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
/*
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/

import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import Transfer from "./components/Transfer";
/*
import Cards from "./components/Cards";
import Loans from "./components/Loans";
import AuditLogs from "./components/AuditLogs";
*/

export default function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="app">
      <h1>🏦 BankChain</h1>

      {!account && <WalletConnect setAccount={setAccount} />}

      {account && (
        <>
          <Dashboard />
          <Deposit />
          <Withdraw />
          <Transfer />
          {/*
          <Cards />
          <Loans />
          <AuditLogs />
          */}
        </>
      )}
    </div>
  );
}
