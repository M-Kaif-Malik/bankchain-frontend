import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getLoansContract, getSigner, getAccountRegistryContract } from "../utils/contract";
import { logAuditAction } from "../utils/auditLogger";

export default function Loans() {
  const [principal, setPrincipal] = useState("");
  const [interest, setInterest] = useState("");
  const [loanId, setLoanId] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [status, setStatus] = useState("");
  const [myLoans, setMyLoans] = useState([]);

  useEffect(() => {
    const loadMyLoans = async () => {
      try {
        setStatus("Loading your loans...");

        const registry = await getAccountRegistryContract();
        const myId = await registry.getMyAccountId();
        if (!myId || myId.length === 0) {
          setMyLoans([]);
          setStatus("No account ID registered. Register one on the Accounts page to use loans.");
          return;
        }

        const wallet = await registry.resolveAccount(myId);
        const accountId = ethers.zeroPadValue(wallet.toLowerCase(), 32);

        const loans = await getLoansContract();
        const total = await loans.loanCounter();

        const items = [];
        for (let i = 1n; i <= total; i++) {
          const loan = await loans.loans(i);
          const loanAccountId = loan.accountId || loan[0];
          const principal = loan.principal || loan[1];
          const interest = loan.interest || loan[2];
          const approved = loan.approved ?? loan[3];
          const repaid = loan.repaid ?? loan[4];

          if (loanAccountId === accountId) {
            items.push({
              id: i.toString(),
              principal,
              interest,
              approved,
              repaid,
            });
          }
        }

        setMyLoans(items);
        setStatus("");
      } catch (error) {
        console.error("loadMyLoans error:", error);
        setStatus(`Error loading loans: ${error.message}`);
      }
    };

    loadMyLoans();
  }, []);

  const applyLoan = async () => {
    try {
      setStatus("Applying for loan...");

      const signer = await getSigner();

      // Require that the user has registered an account id in AccountRegistry
      const registry = await getAccountRegistryContract();
      const myId = await registry.getMyAccountId();
      if (!myId || myId.length === 0) {
        setStatus("Error: please register an account ID in the Dashboard first");
        return;
      }

      // Resolve the registered account ID to the underlying wallet and derive bytes32 id from that
      const wallet = await registry.resolveAccount(myId);
      const accountId = ethers.zeroPadValue(wallet.toLowerCase(), 32);

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

  const repayLoan = async () => {
    try {
      setStatus("Repaying loan...");
      const loans = await getLoansContract();

      // Require that the user has registered an account id in AccountRegistry
      const registry = await getAccountRegistryContract();
      const myId = await registry.getMyAccountId();
      if (!myId || myId.length === 0) {
        setStatus("Error: please register an account ID in the Dashboard first");
        return;
      }
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
    <div style={{ padding: "1.5rem", border: "1px solid #222", borderRadius: 12, background: "#050509" }}>
      <h2>Loans</h2>
      <p>Apply for loans and repay existing ones using your registered account.</p>

      <div style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
        <h3>Apply for Loan</h3>
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

      <div style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
        <h3>Repay Loan</h3>
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

      <div style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
        <h3>Your Loans</h3>
        {myLoans.length === 0 && (
          <p style={{ fontSize: "0.9rem" }}>No loans found for your account.</p>
        )}
        {myLoans.length > 0 && (
          <table style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th align="left">Loan ID</th>
                <th align="left">Principal (ETH)</th>
                <th align="left">Interest (ETH)</th>
                <th align="left">Status</th>
              </tr>
            </thead>
            <tbody>
              {myLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.id}</td>
                  <td>{ethers.formatEther(loan.principal)}</td>
                  <td>{ethers.formatEther(loan.interest)}</td>
                  <td>
                    {loan.repaid
                      ? "Repaid"
                      : loan.approved
                      ? "Approved"
                      : "Pending"}
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
