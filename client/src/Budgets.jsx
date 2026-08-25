import { useState, useEffect } from "react";
import api from "./api";
import Select from "./Select";
import { fmtINR } from "./format";
import ConfirmModal from "./ConfirmModal";

const CATEGORIES = [
  "Overall",
  "Food",
  "Travel",
  "Medical",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

function Budgets({ user, reloadKey }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Overall");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, reloadKey]);

  async function fetchBudgets() {
    try {
      setError("");
      setLoading(true);
      const res = await api.get(`/budgets?userId=${user.id}`);
      setBudgets(res.data);
    } catch {
      setError(
        "Couldn't load your budgets. The server may still be waking up — try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/budgets", {
        userId: user.id,
        category,
        limit: Number(limit),
      });
      setLimit("");
      fetchBudgets();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteError("");
      await api.delete(
        `/budgets?userId=${user.id}&category=${encodeURIComponent(deleteTarget.category)}`,
      );
      setDeleteTarget(null);
      fetchBudgets();
    } catch {
      setDeleteError(
        "Couldn't delete this budget. If it keeps failing, the server may need an update.",
      );
      setDeleteTarget(null);
    }
  };

  const getBarColor = (percent) => {
    if (percent >= 100) return "var(--color-negative)";
    if (percent >= 90) return "#e2a13f";
    return "var(--color-positive)";
  };

  return (
    <>
      <section className="section">
      <div className="section-head">
        <h2 className="display-sm">Budgets</h2>
      </div>

      {budgets.some((b) => b.percentUsed >= 90) && (
        <div
          className="card"
          style={{ borderColor: "var(--color-negative)", marginBottom: "16px" }}
        >
          <strong style={{ color: "var(--color-negative)" }}>
            ⚠ You're close to or over budget in one or more categories.
          </strong>
        </div>
      )}

      <div className="card" style={{ marginBottom: "16px" }}>
        <form onSubmit={handleSetBudget} className="form-row">
          <div className="field">
            <span className="field-label">Category</span>
            <Select
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
              placeholder="Select category"
            />
          </div>
          <label className="field">
            <span className="field-label">Monthly limit</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="₹"
              className="text-input"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !limit}
          >
            {saving ? "Saving…" : "Set Budget"}
          </button>
        </form>
      </div>

      {deleteError && <p className="error-text">{deleteError}</p>}
      {loading ? (
        <div className="empty-state">
          <h3>Loading budgets…</h3>
        </div>
      ) : error ? (
        <div>
          <p className="error-text">{error}</p>
          <button
            type="button"
            className="btn btn-subtle"
            style={{ marginTop: "12px" }}
            onClick={fetchBudgets}
          >
            Retry
          </button>
        </div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <h3>No budgets yet</h3>
          <p>Set a monthly limit and track your spending against it.</p>
        </div>
      ) : (
        budgets.map((b) => (
          <div key={b._id} className="card" style={{ marginBottom: "10px" }}>
            <div className="chart-row-head">
              <span className="chart-cat">{b.category}</span>
              <span className="chart-val">
                {fmtINR(b.spent)} / {fmtINR(b.limit)} ({b.percentUsed}%)
              </span>
            </div>
            <div className="chart-track">
              <div
                className="chart-bar"
                style={{
                  width: `${Math.min(b.percentUsed, 100)}%`,
                  background: getBarColor(b.percentUsed),
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "12px",
              }}
            >
              <button
                type="button"
                className="expense-delete"
                aria-label={`Delete ${b.category} budget`}
                onClick={() => setDeleteTarget(b)}
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
            </div>
          </div>
        ))
      )}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete budget?"
        message={`Delete the ${deleteTarget?.category || ""} budget of ${deleteTarget ? fmtINR(deleteTarget.limit) : ""} per month?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default Budgets;