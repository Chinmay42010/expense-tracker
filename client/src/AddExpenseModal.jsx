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

function AddExpenseModal({ open, onSubmit, onClose }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayStr);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(null);

  useEffect(() => {
    if (open) amountRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setNote("");
    setDate(todayStr());
    setIsRecurring(false);
    setRecurrence("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Add an expense" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          ref={amountRef}
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          className="text-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Select
          value={category}
          onChange={setCategory}
          options={CATEGORIES}
          placeholder="Select category"
        />
        <input
          type="date"
          aria-label="Date"
          className="text-input"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Note (optional)"
          className="text-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
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
          <Select
            value={recurrence}
            onChange={setRecurrence}
            options={RECURRENCE_OPTIONS}
            placeholder="Repeat every…"
          />
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !amount || !category || (isRecurring && !recurrence)}
        >
          {submitting ? "Adding…" : "Add expense"}
        </button>
      </form>
    </Modal>
  );
}

export default AddExpenseModal;