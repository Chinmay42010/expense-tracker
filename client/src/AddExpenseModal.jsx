import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Select from "./Select";

const CATEGORIES = [
  "Food",
  "Travel",
  "Medical",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

const RECURRENCE_OPTIONS = ["Weekly", "Monthly"];

const todayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const toDateStr = (value) => {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const toTimestamp = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dateStr === todayStr()) {
    const now = new Date();
    dt.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
  } else {
    dt.setHours(12, 0, 0, 0);
  }
  return dt.toISOString();
};

function AddExpenseModal({ open, onSubmit, onClose, expense }) {
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState(expense?.category ?? "");
  const [note, setNote] = useState(expense?.note ?? "");
  const [date, setDate] = useState(() =>
    expense ? toDateStr(expense.date) : todayStr(),
  );
  const [isRecurring, setIsRecurring] = useState(!!expense?.isRecurring);
  const [recurrence, setRecurrence] = useState(
    expense?.recurrence
      ? expense.recurrence[0].toUpperCase() + expense.recurrence.slice(1)
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(null);

  useEffect(() => {
    if (open) amountRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        category,
        note,
        date: toTimestamp(date),
        isRecurring,
        recurrence: isRecurring ? recurrence.toLowerCase() : null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={expense ? "Edit expense" : "Add an expense"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span className="field-label">Amount</span>
          <input
            ref={amountRef}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="text-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
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
          <span className="field-label">Date</span>
          <input
            type="date"
            aria-label="Date"
            className="text-input"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Note</span>
          <input
            type="text"
            placeholder="Optional"
            className="text-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => {
              setIsRecurring(e.target.checked);
              if (!e.target.checked) setRecurrence("");
            }}
          />
          <span>Recurring expense</span>
        </label>
        {isRecurring && (
          <div className="field">
            <span className="field-label">Repeats every</span>
            <Select
              value={recurrence}
              onChange={setRecurrence}
              options={RECURRENCE_OPTIONS}
              placeholder="Select frequency"
            />
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !amount || !category || (isRecurring && !recurrence)}
        >
          {submitting ? "Saving…" : expense ? "Save changes" : "Add expense"}
        </button>
      </form>
    </Modal>
  );
}

export default AddExpenseModal;