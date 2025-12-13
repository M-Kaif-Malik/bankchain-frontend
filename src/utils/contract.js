import { ethers } from "ethers";

import Accounts from "../contracts/Accounts.json";
import Audit from "../contracts/Audit.json";
import Cards from "../contracts/Cards.json";
import Loans from "../contracts/Loans.json";

// paste deployed addresses
const ADDRESSES = {
  accounts: import.meta.env.VITE_ACCOUNTS_ADDRESS, // "0xACCOUNTS_ADDRESS"
  audit: import.meta.env.VITE_AUDIT_ADDRESS, // "0xAUDIT_ADDRESS"
  cards: import.meta.env.VITE_CARDS_ADDRESS, // "0xCARDS_ADDRESS"
  loans: import.meta.env.VITE_LOANS_ADDRESS, // "0xLOANS_ADDRESS"
};

let provider;
let signer;

async function getSigner() {
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
  }
  return signer;
}

export async function getAccountsContract() {
  const signer = await getSigner();
  return new ethers.Contract(ADDRESSES.accounts, Accounts.abi, signer);
}

export async function getAuditContract() {
  const signer = await getSigner();
  return new ethers.Contract(ADDRESSES.audit, Audit.abi, signer);
}

export async function getCardsContract() {
  const signer = await getSigner();
  return new ethers.Contract(ADDRESSES.cards, Cards.abi, signer);
}

export async function getLoansContract() {
  const signer = await getSigner();
  return new ethers.Contract(ADDRESSES.loans, Loans.abi, signer);
}
