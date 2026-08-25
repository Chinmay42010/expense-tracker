import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Select from "./Select";

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

function SetBudgetModal({ open, onSubmit, onClose }) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const limitRef = useRef(null);

  useEffect(() => {
    if (open) limitRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ category, limit: Number(limit) });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Set a budget" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
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
            ref={limitRef}
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
          disabled={submitting || !limit || !category}
        >
          {submitting ? "Saving…" : "Set budget"}
        </button>
      </form>
    </Modal>
  );
}

export default SetBudgetModal;