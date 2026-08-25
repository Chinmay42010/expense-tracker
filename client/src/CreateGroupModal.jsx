import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

function CreateGroupModal({ open, onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
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
      await onSubmit({ name, hostName: hostName.trim(), members });
      setName("");
      setHostName("");
      setMembersInput("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Create a group" onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span className="field-label">Group name</span>
          <input
            ref={nameRef}
            type="text"
            placeholder="e.g. Goa trip"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Your name in this group</span>
          <input
            type="text"
            placeholder="e.g. Chinmay"
            className="text-input"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Members</span>
          <input
            type="text"
            placeholder="Comma separated, e.g. Rahul, Priya"
            className="text-input"
            value={membersInput}
            onChange={(e) => setMembersInput(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create group"}
        </button>
      </form>
    </Modal>
  );
}

export default CreateGroupModal;
