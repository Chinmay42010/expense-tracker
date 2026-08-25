import { useState, useEffect } from "react";
import api from "./api";
import { fmtINR } from "./format";

function SpendingChart({ expenses, user }) {
  const [budgets, setBudgets] = useState({}); // { category: { limit, spent, percentUsed, _id } }
  const [editingCategory, setEditingCategory] = useState(null);
  const [limitInput, setLimitInput] = useState("");
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsError, setBudgetsError] = useState("");

  useEffect(() => {
    if (user) fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchBudgets() {
    try {
      setBudgetsError("");
      const res = await api.get(`/budgets?userId=${user.id}`);
      const map = {};
      res.data.forEach((b) => {
        map[b.category] = b;
      });
      setBudgets(map);
    } catch {
      setBudgetsError("Couldn't load budgets.");
    } finally {
      setBudgetsLoading(false);
    }
  };

  const handleSaveBudget = async (category) => {
    await api.post("/budgets", {
      userId: user.id,
      category,
      limit: Number(limitInput),
    });
    setEditingCategory(null);
    setLimitInput("");
    fetchBudgets();
  };

  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="empty-state">
        <h3>No spending yet</h3>
        <p>Add an expense and your category breakdown will show up here.</p>
      </div>
    );
  }

  const getBudgetColor = (percent) => {
    if (percent >= 100) return "var(--color-negative)";
    if (percent >= 90) return "#e2a13f";
    return "var(--color-positive)";
  };

  return (
    <div className="chart">
      {budgetsError && (
        <p className="error-text">
          {budgetsError}{" "}
          <button type="button" className="link-btn" onClick={fetchBudgets}>
            Retry
          </button>
        </p>
      )}
      {budgetsLoading && !budgetsError && Object.keys(budgets).length === 0 && (
        <p className="expense-meta">Loading budgets…</p>
      )}
      {chartData.map((entry, i) => {
        const pct = Math.round((entry.value / total) * 100);
        const budget = budgets[entry.name];

        return (
          <div key={entry.name} className="chart-row">
            <div className="chart-row-head">
              <span className="chart-cat">{entry.name}</span>
              <span className="chart-val">
                {"₹" + entry.value.toLocaleString("en-IN")} · {pct}%
              </span>
            </div>
            <div className="chart-track">
              <div
                className="chart-bar"
                style={{ width: `${pct}%`, animationDelay: `${i * 70}ms` }}
              />
            </div>

            {editingCategory === entry.name ? (
              <form
                className="form-row"
                style={{ marginTop: "var(--space-sm)" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveBudget(entry.name);
                }}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Monthly limit (₹)"
                  aria-label={`${entry.name} monthly limit`}
                  className="text-input"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-subtle"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="chart-budget">
                {budget && (
                  <span className="chart-budget-meta">
                    {fmtINR(budget.spent)} of {fmtINR(budget.limit)} ·{" "}
                    <span style={{ color: getBudgetColor(budget.percentUsed) }}>
                      {budget.percentUsed}% used
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  className={`btn-chip ${budget ? "" : "btn-chip-quiet"}`}
                  onClick={() => {
                    setEditingCategory(entry.name);
                    setLimitInput(budget ? String(budget.limit) : "");
                  }}
                >
                  {budget ? "Edit" : "+ Set budget"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SpendingChart;
