# BankChain Frontend

A lightweight React frontend for the BankChain demo application. This project is built with Vite and provides a UI to interact with on-chain contracts (accounts, cards, loans, audits, transactions) and includes admin views, wallet connection utilities, and common banking flows.


**Quick links**
- Project: [BankChain Frontend](README.md)
- Main entry: src/main.jsx

## Features

- Connect to web3 wallets and interact with deployed contracts.
- User flows: Dashboard, Deposit, Withdraw, Transfer, Loans, Cards, Transactions.
- Admin views: Accounts, Loans, Audit.
- Local contract artifacts exported in `contracts/` for development and debugging.

## Tech stack

- React (JSX) + Vite
- Modern CSS (see `src/styles/`)
- Wallet utilities in `src/utils/wallet.js`
- Contract artifacts in `contracts/` (ABI + addresses JSON)

## Prerequisites

- Node.js 18+ (or a recent LTS)
- npm (or yarn)
- A web3 wallet (MetaMask, WalletConnect-enabled wallet) for interacting with contracts

## Install

Install dependencies:

```bash
npm install
```

## Run (development)

Start the dev server:

```bash
npm run dev
```

Open the local dev URL printed by Vite (usually http://localhost:5173).

## Build

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment

This project uses Vite. If you need runtime configuration, add a `.env` or `.env.local` file at the project root and prefix client variables with `VITE_` (for example `VITE_RPC_URL` or `VITE_ACCOUNTS_ADDRESS`). Example variables you might add:

```
VITE_ACCOUNTS_ADDRESS=0x...
```

Adjust keys to match your deployment and contract names.

## Contracts

The `contracts/` directory includes JSON files with ABI and address information useful for local development. When building or deploying against a different network, update the addresses or supply them via environment variables and the contract helper in `src/utils/contract.js`.

## Project structure (high level)

- `src/` — app source
  - `components/` — page and UI components (Dashboard, Transfer, Loans, Admin views)
  - `layout/` — `Sidebar`, `TopBar`, and `Layout`
  - `contexts/` — React contexts (e.g., `BalanceContext.jsx`)
  - `utils/` — helpers (`wallet.js`, `contract.js`, `auditLogger.js`)
- `contracts/` — ABI and deployed addresses used by the frontend

## Usage notes

- Connect a web3 wallet via the wallet UI in the header or `WalletConnect` component.
- Use the Dashboard for quick balance/portfolio views and `Transactions` to inspect activity.
- Admin pages (under `components/Admin*`) assume elevated privileges — confirm your connected address maps to an admin account on the chain.

## Contributing

1. Fork the repo and create a feature branch.
2. Open a PR describing the change and the motivation.
3. Keep changes focused and include small, testable commits.

## Troubleshooting

- If contracts are missing or addresses are incorrect, verify `contracts/` JSON and your `VITE_` environment variables.
- For wallet connection problems, ensure the wallet is configured for the same network as `VITE_RPC_URL`.


- add an `.env.example` with recommended variables,
- add a short development checklist to `package.json` scripts,
- or open a PR with these changes.
