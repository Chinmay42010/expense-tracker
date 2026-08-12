import { useState, useEffect } from "react";
import api from "./api";
import { fmtINR, fmtDateTime } from "./format";
import ConfirmModal from "./ConfirmModal";

function GroupDetail({ group, onBack, reloadKey }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchGroupExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  async function fetchGroupExpenses() {
    try {
      setError("");
      setLoading(true);
      const res = await api.get(`/group-expenses/${group._id}`);
      setExpenses(res.data.expenses);
      setBalances(res.data.balances);
      setSettlements(res.data.settlements);
    } catch {
      setError(
        "Couldn't load this group's expenses. Try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteError("");
      await api.delete(`/group-expenses/${group._id}/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchGroupExpenses();
    } catch {
      setDeleteError(
        "Couldn't delete this expense. If it keeps failing, the server may need an update.",
      );
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <button type="button" className="btn btn-subtle back-btn" onClick={onBack}>
        ← Back to groups
      </button>

      <section className="hero-band">
        <h1 className="display-xl">{group.name}</h1>
        <div className="mini-chip-row">
          {group.members.map((m) => (
            <span key={m} className="mini-chip">
              {m}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="display-sm">Expenses</h2>
        </div>
        {deleteError && <p className="error-text">{deleteError}</p>}
        {loading ? (
          <div className="empty-state">
            <h3>Loading expenses…</h3>
          </div>
        ) : error ? (
          <div>
            <p className="error-text">{error}</p>
            <button
              type="button"
              className="btn btn-subtle"
              style={{ marginTop: "12px" }}
              onClick={fetchGroupExpenses}
            >
              Retry
            </button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <h3>No expenses yet</h3>
            <p>Add the first expense to start splitting.</p>
          </div>
        ) : (
          <div className="card">
            <ul className="expense-list">
              {expenses.map((exp) => (
                <li key={exp._id} className="expense-item">
                  <span className="expense-category">{exp.category}</span>
                  <div className="expense-mid">
                    <span className="expense-note">
                      {exp.note
                        ? `${exp.note} · paid by ${exp.paidBy}`
                        : `paid by ${exp.paidBy}`}
                    </span>
                    <span className="expense-date">
                      {fmtDateTime(exp.createdAt)}
                    </span>
                  </div>
                  <span className="expense-amount">{fmtINR(exp.amount)}</span>
                  <button
                    type="button"
                    className="expense-delete"
                    aria-label={`Delete ${exp.note || "expense"}`}
                    onClick={() => setDeleteTarget(exp)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="display-sm">Balances</h2>
        </div>
        <div className="card-dark stagger">
          {Object.keys(balances).length === 0 ? (
            <p className="on-dark-sub">No balances yet.</p>
          ) : (
            Object.entries(balances).map(([person, amt]) => (
              <div key={person} className="balance-row">
                <span className="balance-name">{person}</span>
                <span
                  className={`balance-pill ${
                    amt >= 0 ? "balance-pill-gets" : "balance-pill-owes"
                  }`}
                >
                  {amt >= 0
                    ? `gets ₹${amt.toFixed(2)}`
                    : `owes ₹${Math.abs(amt).toFixed(2)}`}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="display-sm">Settle up</h2>
        </div>
        <div className="card-soft stagger">
          {settlements.length === 0 ? (
            <p className="muted">All settled up.</p>
          ) : (
            settlements.map((s, i) => (
              <div key={i} className="settlement-row">
                <span className="settlement-person">{s.from}</span>
                <span className="settlement-arrow" aria-hidden="true">
                  →
                </span>
                <span className="settlement-person">{s.to}</span>
                <span className="settlement-amount">₹{s.amount}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete expense?"
        message={
          deleteTarget
            ? `${deleteTarget.note || "Expense"} — ${fmtINR(deleteTarget.amount)}`
            : ""
        }
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default GroupDetail;
