import { ethers } from "ethers";
import { getAuditContract } from "./contract";

// Helper to log actions to the on-chain Audit contract.
// Note: Audit.logAction is onlyOwner, so this will succeed only when
// the connected MetaMask account is the Audit contract owner.
// Failures are swallowed so core flows (deposit/withdraw, loans, cards) still work.
export async function logAuditAction(action, accountId, amountWei) {
  try {
    const audit = await getAuditContract();
    const tx = await audit.logAction(action, accountId, amountWei);
    await tx.wait();
  } catch (err) {
    // On custom networks without ENS, ethers may throw UNSUPPORTED_OPERATION / getEnsAddress
    // or an error whose message includes "network does not support ENS". Swallow those quietly.
    if (
      (err.code === "UNSUPPORTED_OPERATION" &&
        (err.operation === "getEnsAddress" || err.info?.operation === "getEnsAddress")) ||
      (typeof err.message === "string" && err.message.includes("network does not support ENS"))
    ) {
      return;
    }

    console.error("Audit log failed:", err);
  }
}
