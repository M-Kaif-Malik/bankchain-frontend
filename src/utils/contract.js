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
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // Lazily create provider and signer, but also recover if signer was never set
    if (!provider) {
      provider = new ethers.BrowserProvider(window.ethereum);
    }

    if (!signer) {
      signer = await provider.getSigner();
    }

    if (!signer) {
      throw new Error("Unable to get signer from provider");
    }

    return signer;
  } catch (error) {
    console.error("Error getting signer:", error);
    throw error;
  }
}

export { getSigner };

export async function getAccountsContract() {
  const signer = await getSigner();
  const address = ADDRESSES.accounts;
  
  if (!address) {
    throw new Error("Accounts contract address not configured. Please set VITE_ACCOUNTS_ADDRESS in your environment variables.");
  }
  
  return new ethers.Contract(address, Accounts.abi, signer);
}

export async function getAuditContract() {
  const signer = await getSigner();
  const address = ADDRESSES.audit;
  
  if (!address) {
    throw new Error("Audit contract address not configured. Please set VITE_AUDIT_ADDRESS in your environment variables.");
  }
  
  return new ethers.Contract(address, Audit.abi, signer);
}

export async function getCardsContract() {
  const signer = await getSigner();
  const address = ADDRESSES.cards;
  
  if (!address) {
    throw new Error("Cards contract address not configured. Please set VITE_CARDS_ADDRESS in your environment variables.");
  }
  
  return new ethers.Contract(address, Cards.abi, signer);
}

export async function getLoansContract() {
  const signer = await getSigner();
  const address = ADDRESSES.loans;
  
  if (!address) {
    throw new Error("Loans contract address not configured. Please set VITE_LOANS_ADDRESS in your environment variables.");
  }
  
  return new ethers.Contract(address, Loans.abi, signer);
}
