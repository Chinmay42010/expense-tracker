import { useState, useEffect } from "react";
import api from "./api";
import { fmtINR, fmtDateTime } from "./format";
import ConfirmModal from "./ConfirmModal";
import Modal from "./Modal";

function GroupDetail({ group, onBack, reloadKey }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

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
                <li
                  key={exp._id}
                  className="expense-item"
                  tabIndex={0}
                  onClick={(e) => {
                    if (e.target.closest("button")) return;
                    setDetailTarget(exp);
                  }}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      !e.target.closest("button")
                    ) {
                      e.preventDefault();
                      setDetailTarget(exp);
                    }
                  }}
                >
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
          <h2 className="display-sm">Settle up</h2>
        </div>
        {Object.keys(balances).length === 0 ||
        Object.values(balances).every((amt) => Math.abs(amt) < 0.01) ? (
          <div className="card-soft stagger">
            <p className="muted" style={{ margin: 0 }}>
              All settled up — nobody owes anybody.
            </p>
          </div>
        ) : (
          <>
            <div className="card-dark stagger">
              {Object.entries(balances).map(([person, amt]) => (
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
              ))}
            </div>
            {settlements.length > 0 && (
              <div className="card-soft stagger" style={{ marginTop: "var(--space-lg)" }}>
                {settlements.map((s, i) => (
                  <div key={i} className="settlement-row">
                    <span className="settlement-person">{s.from}</span>
                    <span className="settlement-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="settlement-person">{s.to}</span>
                    <span className="settlement-amount">{fmtINR(s.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {detailTarget && (
        <Modal
          open
          title="Expense details"
          onClose={() => setDetailTarget(null)}
        >
          <div className="detail">
            <div className="detail-hero">
              <span className="expense-category">{detailTarget.category}</span>
              <span className="detail-amount">
                {fmtINR(detailTarget.amount)}
              </span>
              <span className="detail-sub">
                Paid by {detailTarget.paidBy}
              </span>
            </div>
            <ul className="detail-rows">
              <li>
                <span>Added on</span>
                <strong>{fmtDateTime(detailTarget.createdAt)}</strong>
              </li>
              <li>
                <span>Split between</span>
                <strong>{detailTarget.splitBetween.length} people</strong>
              </li>
              <li>
                <span>Share each</span>
                <strong>
                  {fmtINR(detailTarget.amount / detailTarget.splitBetween.length)}
                </strong>
              </li>
            </ul>
            {detailTarget.splitBetween.length > 0 && (
              <div className="detail-note">
                <span className="field-label">Members</span>
                <div className="detail-chips">
                  {detailTarget.splitBetween.map((m) => (
                    <span key={m} className="mini-chip">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {detailTarget.note && (
              <div className="detail-note">
                <span className="field-label">Note</span>
                <p>{detailTarget.note}</p>
              </div>
            )}
            <div className="detail-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setDeleteTarget(detailTarget);
                  setDetailTarget(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

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
