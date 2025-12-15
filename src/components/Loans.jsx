import { useState } from "react";
import { ethers } from "ethers";
import { getLoansContract, getSigner } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";

export default function Loans() {
  const [accountsAddress, setAccountsAddress] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interest, setInterest] = useState("");
  const [loanId, setLoanId] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [status, setStatus] = useState("");

  const setAccounts = async () => {
    try {
      setStatus("Setting Accounts contract on Loans...");
      const loans = await getLoansContract();
      if (!ethers.isAddress(accountsAddress)) {
        throw new Error("Invalid Accounts contract address");
      }
      const tx = await loans.setAccountsContract(accountsAddress);
      await tx.wait();
      setStatus(`Accounts contract set to ${accountsAddress}`);
    } catch (error) {
      console.error("setAccountsContract error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const applyLoan = async () => {
    try {
      setStatus("Applying for loan...");

      const signer = await getSigner();
      const address = await signer.getAddress();

      // Use the same bytes32 accountId derived from the user's address
      const accountId = ethers.zeroPadValue(address.toLowerCase(), 32);

      const loans = await getLoansContract();
      const principalWei = ethers.parseEther(principal || "0");
      const interestWei = ethers.parseEther(interest || "0");

      const tx = await loans.applyLoan(accountId, principalWei, interestWei);
      const receipt = await tx.wait();

      // LoanApplied(uint256 indexed loanId, bytes32 accountId)
      const event = receipt.logs
        .map((log) => {
          try {
            return loans.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "LoanApplied");

      const newLoanId = event ? event.args.loanId.toString() : "(check tx)";
      setStatus(`Loan applied with loanId ${newLoanId}`);

      // best-effort audit log for loan application (amount = principal)
      await logAuditAction("LoanApplied", accountId, principalWei);
    } catch (error) {
      console.error("applyLoan error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const approveLoan = async () => {
    try {
      setStatus("Approving loan...");
      const loans = await getLoansContract();
      const id = BigInt(loanId);
      const tx = await loans.approveLoan(id);
      await tx.wait();
      setStatus(`Loan ${loanId} approved`);

      // We don't know accountId directly here; log with zero accountId and 0 amount for now
      await logAuditAction("LoanApproved", ethers.ZeroHash, 0n);
    } catch (error) {
      console.error("approveLoan error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const repayLoan = async () => {
    try {
      setStatus("Repaying loan...");
      const loans = await getLoansContract();
      const id = BigInt(loanId);
      const amountWei = ethers.parseEther(repayAmount || "0");
      const tx = await loans.repayLoan(id, { value: amountWei });
      await tx.wait();
      setStatus(`Loan ${loanId} repaid with ${repayAmount} ETH`);

       // audit log for repayment (we don't know accountId from here, log zero accountId)
       await logAuditAction("LoanRepaid", ethers.ZeroHash, amountWei);
    } catch (error) {
      console.error("repayLoan error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>Loans Dashboard</h2>
      <p>Users can apply for and repay loans. Bank admin can link Accounts and approve loans.</p>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Admin: Link Accounts Contract</h3>
        <input
          placeholder="Accounts contract address (0x...)"
          value={accountsAddress}
          onChange={(e) => setAccountsAddress(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={setAccounts}>Set Accounts Contract</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>User: Apply for Loan</h3>
        <input
          placeholder="Principal (ETH)"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <input
          placeholder="Interest (ETH)"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={applyLoan}>Apply Loan for My Account</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Admin: Approve Loan</h3>
        <input
          placeholder="Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={approveLoan}>Approve Loan</button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>User: Repay Loan</h3>
        <input
          placeholder="Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <input
          placeholder="Repay Amount (ETH)"
          value={repayAmount}
          onChange={(e) => setRepayAmount(e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
        <button onClick={repayLoan}>Repay Loan</button>
      </div>

      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
