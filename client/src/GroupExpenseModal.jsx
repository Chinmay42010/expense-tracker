import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

const CATEGORIES = [
  "Food",
  "Travel",
  "Medical",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

function GroupExpenseModal({ open, group, onSubmit, onClose }) {
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(null);

  useEffect(() => {
    if (open) amountRef.current?.focus();
  }, [open]);

  if (!open || !group) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
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
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={`Add expense · ${group.name}`} onClose={onClose}>
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
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Adding…" : "Add expense"}
        </button>
      </form>
    </Modal>
  );
}

export default GroupExpenseModal;
