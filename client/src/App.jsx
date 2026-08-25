import { useState, useEffect } from "react";
import api from "./api";
import Auth from "./Auth";
import { supabase } from "./supabaseClient";
import "./App.css";
import Groups from "./Groups";
import GroupDetail from "./GroupDetail";
import SpendingChart from "./SpendingChart";
import AddExpenseModal from "./AddExpenseModal";
import CreateGroupModal from "./CreateGroupModal";
import GroupExpenseModal from "./GroupExpenseModal";
import ConfirmModal from "./ConfirmModal";
import Modal from "./Modal";
import SetBudgetModal from "./SetBudgetModal";
import { fmtINR, fmtDateTime } from "./format";
import Budgets from "./Budgets";

const CATEGORIES = [
  "Food",
  "Travel",
  "Medical",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const dayLabel = (d) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const groupByDay = (expenses) => {
  const map = new Map();
  expenses.forEach((exp) => {
    const d = new Date(exp.date);
    const key = dayKey(d);
    if (!map.has(key)) map.set(key, { date: d, items: [] });
    map.get(key).items.push(exp);
  });
  return Array.from(map.entries());
};

function App() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [view, setView] = useState("expenses");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [groupsReload, setGroupsReload] = useState(0);
  const [groupDetailReload, setGroupDetailReload] = useState(0);
  const [budgetsReload, setBudgetsReload] = useState(0);
  const [deleteError, setDeleteError] = useState("");
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [dueRecurring, setDueRecurring] = useState([]);
  const [dueDismissed, setDueDismissed] = useState(false);
  const [loggingId, setLoggingId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchDueRecurring();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterCategory]);

  async function fetchExpenses() {
    try {
      setExpensesError("");
      setExpensesLoading(true);
      const query = filterCategory
        ? `/expenses?userId=${user.id}&category=${filterCategory}`
        : `/expenses?userId=${user.id}`;
      const res = await api.get(query);
      setExpenses(res.data);
    } catch {
      setExpensesError(
        "Couldn't load your expenses. The server may still be waking up — try again.",
      );
    } finally {
      setExpensesLoading(false);
    }
  }

  async function fetchDueRecurring() {
    try {
      const res = await api.get(`/expenses/recurring/due?userId=${user.id}`);
      setDueRecurring(res.data);
    } catch {
      setDueRecurring([]);
    }
  }

  const logAgain = async (exp) => {
    setLoggingId(exp._id);
    try {
      const now = new Date().toISOString();
      await api.post("/expenses", {
        userId: user.id,
        amount: exp.amount,
        category: exp.category,
        note: exp.note,
        date: now,
        isRecurring: true,
        recurrence: exp.recurrence,
      });
      // ponytail: bumps the template's date so it leaves the due list; a real
      // recurrence engine (nextDueAt field + cron) if this ever needs schedules
      await api.put(`/expenses/${exp._id}`, { date: now });
      fetchExpenses();
      fetchDueRecurring();
    } finally {
      setLoggingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteError("");
      await api.delete(`/expenses/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchExpenses();
    } catch {
      setDeleteError(
        "Couldn't delete this expense. If it keeps failing, the server may need an update.",
      );
      setDeleteTarget(null);
    }
  };

  const handleModalSubmit = async (payload) => {
    if (editTarget) {
      await api.put(`/expenses/${editTarget._id}`, payload);
      setEditTarget(null);
    } else {
      await api.post("/expenses", { ...payload, userId: user.id });
    }
    fetchExpenses();
  };

  const handleCreateGroup = async (payload) => {
    await api.post("/groups", { ...payload, createdBy: user.id });
    setGroupsReload((n) => n + 1);
  };

  const handleGroupExpenseSubmit = async (payload) => {
    await api.post(`/group-expenses/${selectedGroup._id}`, payload);
    setGroupDetailReload((n) => n + 1);
  };

  const handleBudgetSubmit = async (payload) => {
    await api.post("/budgets", { ...payload, userId: user.id });
    setBudgetsReload((n) => n + 1);
  };

  const openAddModal = () => {
    if (view === "groups") {
      setModalType(selectedGroup ? "groupExpense" : "createGroup");
    } else if (view === "budgets") {
      setModalType("budget");
    } else {
      setModalType("expense");
    }
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const topCategory = expenses.length
    ? Object.entries(
        expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {}),
      ).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return (
    <div className="app-shell">
      <nav className={`nav-bar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <span className="wordmark">Expense Tracker</span>
          <div className="nav-right">
            <span className="nav-user">{user.email}</span>
            <button className="btn btn-subtle" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <div className="tab-bar" role="tablist" aria-label="App sections">
          <button
            type="button"
            role="tab"
            aria-selected={view === "expenses"}
            className={`tab ${view === "expenses" ? "active" : ""}`}
            onClick={() => setView("expenses")}
          >
            My expenses
          </button>
          <button
            type="button"
            className="tab-add"
            aria-label="Add an expense"
            onClick={openAddModal}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "groups"}
            className={`tab ${view === "groups" ? "active" : ""}`}
            onClick={() => setView("groups")}
          >
            Groups
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "budgets"}
            className={`tab ${view === "budgets" ? "active" : ""}`}
            onClick={() => setView("budgets")}
          >
            Budgets
          </button>
        </div>

        <div
          key={
            view === "groups"
              ? selectedGroup
                ? `group-${selectedGroup._id}`
                : "groups"
              : view === "budgets"
                ? "budgets"
                : "expenses"
          }
          className="view-enter stagger"
        >
          {view === "groups" ? (
            selectedGroup ? (
              <GroupDetail
                group={selectedGroup}
                onBack={() => setSelectedGroup(null)}
                reloadKey={groupDetailReload}
              />
            ) : (
              <Groups
                user={user}
                onSelectGroup={(group) => setSelectedGroup(group)}
                reloadKey={groupsReload}
              />
            )
          ) : view === "budgets" ? (
            <Budgets user={user} reloadKey={budgetsReload} />
          ) : (
            <>
              <section className="hero-band">
                <h1 className="display-xl">Your money, at a glance</h1>
                <p className="hero-sub">
                  Everything you've spent, in one place.
                </p>
                <div className="stat-row stagger">
                  <div className="stat-card stat-card-dark">
                    <span className="stat-label">Total spent</span>
                    <span className="stat-value">{fmtINR(totalSpent)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Expenses</span>
                    <span className="stat-value">{expenses.length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Top category</span>
                    <span className="stat-value">{topCategory || "—"}</span>
                  </div>
                </div>
              </section>

              <section className="section">
                <div className="section-head">
                  <h2 className="display-sm">Spending by category</h2>
                </div>
                <div className="card">
                  <SpendingChart expenses={expenses} user={user} />
                </div>
              </section>

              {!dueDismissed && dueRecurring.length > 0 && (
                <section className="section">
                  <div className="due-banner">
                    <div className="due-banner-head">
                      <h3>Recurring expenses due</h3>
                      <button
                        type="button"
                        className="expense-delete due-dismiss"
                        aria-label="Dismiss"
                        onClick={() => setDueDismissed(true)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {dueRecurring.map((exp) => (
                      <div key={exp._id} className="due-row">
                        <span className="due-note">
                          {exp.note || exp.category} · {fmtINR(exp.amount)} ·{" "}
                          every {exp.recurrence}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={loggingId === exp._id}
                          onClick={() => logAgain(exp)}
                        >
                          {loggingId === exp._id ? "Logging…" : "Log again"}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="section">
                <div
                  className="section-head"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2 className="display-sm">Recent expenses</h2>

                  <a
                    href={`${api.defaults.baseURL}/expenses/export/csv?userId=${user.id}`}
                    className="btn btn-subtle"
                    download
                  >
                    Export CSV
                  </a>
                </div>
                {deleteError && <p className="error-text">{deleteError}</p>}
                <div className="chip-row" aria-label="Filter by category">
                  <button
                    type="button"
                    className={`chip ${filterCategory === "" ? "active" : ""}`}
                    onClick={() => setFilterCategory("")}
                  >
                    All
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`chip ${filterCategory === c ? "active" : ""}`}
                      onClick={() =>
                        setFilterCategory(filterCategory === c ? "" : c)
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {expensesError ? (
                  <p className="error-text">{expensesError}</p>
                ) : expenses.length === 0 ? (
                  expensesLoading ? (
                    <div className="card skeleton-list" aria-hidden="true">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton skeleton-row" />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <h3>No expenses yet</h3>
                      <p>Add your first expense to start tracking.</p>
                    </div>
                  )
                ) : (
                  <div className="card">
                    <ul className="expense-list stagger">
                      {groupByDay(expenses).map(([key, group]) => (
                        <li key={key}>
                          <span className="expense-date-header">
                            {dayLabel(group.date)}
                          </span>
                          <ul className="expense-list-inner">
                            {group.items.map((exp) => (
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
                                <span className="expense-category">
                                  {exp.category}
                                </span>
                                {exp.isRecurring && (
                                  <span
                                    className="expense-recurring"
                                    title={`Repeats ${exp.recurrence || "regularly"}`}
                                  >
                                    ↻ {exp.recurrence}
                                  </span>
                                )}
                                <div className="expense-mid">
                                  <span className="expense-note">
                                    {exp.note || "Expense"}
                                  </span>
                                  <span className="expense-date">
                                    {fmtDateTime(exp.date)}
                                  </span>
                                </div>
                                <span className="expense-amount">
                                  {fmtINR(exp.amount)}
                                </span>
                                <button
                                  type="button"
                                  className="expense-delete"
                                  aria-label={`Edit ${exp.note || "expense"}`}
                                  onClick={() => {
                                    setEditTarget(exp);
                                    setModalType("expense");
                                  }}
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
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </button>
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
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <button
        type="button"
        className="fab-add"
        aria-label="Add"
        onClick={openAddModal}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {modalType === "expense" && (
        <AddExpenseModal
          key={editTarget?._id ?? "add"}
          open
          expense={editTarget}
          onSubmit={handleModalSubmit}
          onClose={() => {
            setModalType(null);
            setEditTarget(null);
          }}
        />
      )}
      <CreateGroupModal
        open={modalType === "createGroup"}
        onSubmit={handleCreateGroup}
        onClose={() => setModalType(null)}
      />
      <GroupExpenseModal
        open={modalType === "groupExpense"}
        group={selectedGroup}
        onSubmit={handleGroupExpenseSubmit}
        onClose={() => setModalType(null)}
      />
      <SetBudgetModal
        open={modalType === "budget"}
        onSubmit={handleBudgetSubmit}
        onClose={() => setModalType(null)}
      />

      {detailTarget && (
        <Modal
          open
          title="Expense details"
          onClose={() => setDetailTarget(null)}
        >
          <div className="detail">
            <div className="detail-hero">
              <span className="expense-category">
                {detailTarget.category}
              </span>
              <span className="detail-amount">
                {fmtINR(detailTarget.amount)}
              </span>
            </div>
            <ul className="detail-rows">
              <li>
                <span>Date</span>
                <strong>{fmtDateTime(detailTarget.date)}</strong>
              </li>
              {detailTarget.isRecurring && (
                <li>
                  <span>Repeats</span>
                  <strong>Every {detailTarget.recurrence}</strong>
                </li>
              )}
              <li>
                <span>Added on</span>
                <strong>{fmtDateTime(detailTarget.createdAt)}</strong>
              </li>
            </ul>
            {detailTarget.note && (
              <div className="detail-note">
                <span className="field-label">Note</span>
                <p>{detailTarget.note}</p>
              </div>
            )}
            <div className="detail-actions">
              <button
                type="button"
                className="btn btn-subtle"
                onClick={() => {
                  setEditTarget(detailTarget);
                  setDetailTarget(null);
                  setModalType("expense");
                }}
              >
                Edit
              </button>
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
    </div>
  );
}

export default App;
