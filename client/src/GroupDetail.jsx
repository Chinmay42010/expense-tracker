import { useState, useEffect } from "react";
import api from "./api";

const CATEGORIES = [
  "Food",
  "Travel",
  "Medical",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

function GroupDetail({ group, onBack }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchGroupExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchGroupExpenses() {
    const res = await api.get(`/group-expenses/${group._id}`);
    setExpenses(res.data.expenses);
    setBalances(res.data.balances);
    setSettlements(res.data.settlements);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    await api.post(`/group-expenses/${group._id}`, {
      amount: Number(amount),
      paidBy,
      category,
      note,
      splitBetween: group.members,
    });
    setAmount("");
    setPaidBy("");
    setCategory("");
    setNote("");
    fetchGroupExpenses();
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
          <h2 className="display-sm">Add an expense</h2>
        </div>
        <form onSubmit={handleAddExpense} className="card form-grid">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            className="text-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select
            className="text-input"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            <option value="">Who paid?</option>
            {group.members.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="text-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Note (optional)"
            className="text-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add expense
          </button>
        </form>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="display-sm">Expenses</h2>
        </div>
        {expenses.length === 0 ? (
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
                  <span className="expense-note">
                    {exp.note
                      ? `${exp.note} · paid by ${exp.paidBy}`
                      : `paid by ${exp.paidBy}`}
                  </span>
                  <span className="expense-amount">
                    {"₹" + Number(exp.amount).toLocaleString("en-IN")}
                  </span>
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
    </>
  );
}

export default GroupDetail;
