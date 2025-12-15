import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getAuditContract, getSigner } from "../utils/contract";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [filterMine, setFilterMine] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setStatus("Loading audit logs...");

        const audit = await getAuditContract();
        const signer = await getSigner();
        const address = await signer.getAddress();
        const myAccountId = ethers.zeroPadValue(address.toLowerCase(), 32);

        const filter = audit.filters.AuditLog();
        const events = await audit.queryFilter(filter, 0, "latest");

        let parsed = events.map((ev) => ({
          action: ev.args.action,
          accountId: ev.args.accountId,
          amount: ev.args.amount,
          timestamp: Number(ev.args.timestamp),
          txHash: ev.transactionHash,
        }));

        if (filterMine) {
          parsed = parsed.filter((e) =>
            e.accountId.toLowerCase() === myAccountId.toLowerCase()
          );
        }

        // newest first
        parsed.sort((a, b) => b.timestamp - a.timestamp);

        setLogs(parsed);
        setStatus("");
      } catch (err) {
        // On custom networks without ENS, ethers may throw UNSUPPORTED_OPERATION / getEnsAddress
        // or an error whose message includes "network does not support ENS".
        // Treat that as "no ENS support" and just show an empty audit list without logging noise.
        if (
          (err.code === "UNSUPPORTED_OPERATION" &&
            (err.operation === "getEnsAddress" || err.info?.operation === "getEnsAddress")) ||
          (typeof err.message === "string" && err.message.includes("network does not support ENS"))
        ) {
          setLogs([]);
          setStatus("");
          return;
        }

        console.error("loadLogs error", err);
        setStatus("Failed to load audit logs: " + err.message);
      }
    }

    loadLogs();
  }, [filterMine]);

  return (
    <div className="card">
      <h2>Audit Logs</h2>
      <label className="label">
        <input
          type="checkbox"
          checked={filterMine}
          onChange={(e) => setFilterMine(e.target.checked)}
          style={{ marginRight: "0.5rem" }}
        />
        Show only my account
      </label>
      {status && <p className="status">{status}</p>}

      {!status && logs.length === 0 && (
        <p className="status">No audit events found.</p>
      )}

      {logs.length > 0 && (
        <table style={{ width: "100%", marginTop: "1rem", fontSize: "0.9rem" }}>
          <thead>
            <tr>
              <th align="left">Time</th>
              <th align="left">Action</th>
              <th align="left">Amount (ETH)</th>
              <th align="left">Account ID</th>
              <th align="left">Tx</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={log.txHash + idx}>
                <td>{new Date(log.timestamp * 1000).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{ethers.formatEther(log.amount)}</td>
                <td style={{ fontFamily: "monospace" }}>
                  {log.accountId.slice(0, 10)}...
                </td>
                <td style={{ fontFamily: "monospace" }}>
                  {log.txHash.slice(0, 10)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
