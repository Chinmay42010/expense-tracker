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
          <span className="field-label">Paid by</span>
          <Select
            value={paidBy}
            onChange={setPaidBy}
            options={group.members}
            placeholder="Select member"
          />
        </div>
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
          <span className="field-label">Note</span>
          <input
            type="text"
            placeholder="Optional"
            className="text-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !amount || !paidBy || !category}
        >
          {submitting ? "Adding…" : "Add expense"}
        </button>
      </form>
    </Modal>
  );
}

export default GroupExpenseModal;
