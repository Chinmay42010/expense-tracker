import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

function CreateGroupModal({ open, onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [membersInput, setMembersInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const members = membersInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    setSubmitting(true);
    try {
      await onSubmit({ name, members });
      setName("");
      setMembersInput("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Create a group" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          ref={nameRef}
          type="text"
          placeholder="Group name"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Members — comma separated, e.g. Rahul, Priya"
          className="text-input"
          value={membersInput}
          onChange={(e) => setMembersInput(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create group"}
        </button>
      </form>
    </Modal>
  );
}

export default CreateGroupModal;
