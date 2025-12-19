import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getLoansContract } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";

export default function AdminLoans() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [rejectedIds, setRejectedIds] = useState(new Set());
  const [status, setStatus] = useState("");

  const loadLoans = async () => {
    try {
      setStatus("Loading loans...");
      const loans = await getLoansContract();
      const total = await loans.loanCounter();

      const items = [];
      for (let i = 1n; i <= total; i++) {
        const loan = await loans.loans(i);
        const accountId = loan.accountId || loan[0];
        const principal = loan.principal || loan[1];
        const interest = loan.interest || loan[2];
        const approved = loan.approved ?? loan[3];
        const repaid = loan.repaid ?? loan[4];

        if (!approved && !repaid && !rejectedIds.has(i.toString())) {
          items.push({
            id: i.toString(),
            accountId,
            principal,
            interest,
          });
        }
      }

      setPendingLoans(items);
      setStatus("");
    } catch (err) {
      console.error("loadLoans admin error", err);
      setStatus("Failed to load loans: " + err.message);
    }
  };

  useEffect(() => {
    loadLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccounts = async () => {
    try {
      setStatus("Setting Accounts contract on Loans...");
      const loans = await getLoansContract();
      const accountsAddress = import.meta.env.VITE_ACCOUNTS_ADDRESS;

      if (!accountsAddress || !ethers.isAddress(accountsAddress)) {
        throw new Error("Accounts contract address not configured. Please set VITE_ACCOUNTS_ADDRESS in your environment.");
      }

      const tx = await loans.setAccountsContract(accountsAddress);
      await tx.wait();
      setStatus(`Accounts contract set to ${accountsAddress}`);
    } catch (error) {
      console.error("setAccountsContract error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const approveLoan = async (loanId) => {
    try {
      setStatus(`Approving loan ${loanId}...`);
      const loans = await getLoansContract();
      const id = BigInt(loanId);

      const loan = await loans.loans(id);
      const accountId = loan.accountId || loan[0];
      const principal = loan.principal || loan[1];

      const tx = await loans.approveLoan(id, { value: principal });
      await tx.wait();

      await logAuditAction("LoanApproved", accountId, principal);

      setStatus(`Loan ${loanId} approved`);
      await loadLoans();
    } catch (error) {
      console.error("approveLoan admin error", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const rejectLoan = (loanId) => {
    // UI-only rejection: hide it from the pending list locally
    setRejectedIds((prev) => new Set(prev).add(loanId));
    setPendingLoans((prev) => prev.filter((l) => l.id !== loanId));
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>Loans Admin</h2>
      <p>Link Accounts contract and manage pending loan applications.</p>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3>Link Accounts Contract</h3>
        <p style={{ fontSize: "0.9rem" }}>
          Uses the configured VITE_ACCOUNTS_ADDRESS from the environment.
        </p>
        <button onClick={setAccounts}>Set Accounts Contract from Config</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h3>Pending Loan Applications</h3>
        {pendingLoans.length === 0 && <p>No pending loans.</p>}
        {pendingLoans.length > 0 && (
          <table style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th align="left">Loan ID</th>
                <th align="left">Account ID</th>
                <th align="left">Principal (ETH)</th>
                <th align="left">Interest (ETH)</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.id}</td>
                  <td style={{ fontFamily: "monospace" }}>
                    {loan.accountId.slice(0, 10)}...
                  </td>
                  <td>{ethers.formatEther(loan.principal)}</td>
                  <td>{ethers.formatEther(loan.interest)}</td>
                  <td>
                    <button
                      style={{ marginRight: "0.5rem" }}
                      onClick={() => approveLoan(loan.id)}
                    >
                      Approve
                    </button>
                    <button onClick={() => rejectLoan(loan.id)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}
