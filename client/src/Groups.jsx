import { useState, useEffect } from "react";
import api from "./api";
import { fmtDateTime } from "./format";
import ConfirmModal from "./ConfirmModal";

function Groups({ user, onSelectGroup, reloadKey }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [deleteError, setDeleteError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    api
      .get(`/groups?userId=${user.id}`)
      .then((res) => {
        setError("");
        setGroups(res.data);
      })
      .catch(() => {
        setError(
          "Couldn't load your groups. The server may still be waking up — try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reloadKey, retryKey, user.id]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteError("");
      await api.delete(`/groups/${deleteTarget._id}`, {
        data: { userId: user.id },
      });
      setDeleteTarget(null);
      setRetryKey((n) => n + 1);
    } catch {
      setDeleteError(
        "Couldn't delete this group. If it keeps failing, the server may need an update.",
      );
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <section className="hero-band">
        <h1 className="display-xl">Split expenses, stay settled</h1>
        <p className="hero-sub">
          Create groups, track shared spending, and settle up.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="display-sm">Your groups</h2>
        </div>
        {deleteError && <p className="error-text">{deleteError}</p>}
        {loading ? (
          <div className="empty-state">
            <h3>Loading groups…</h3>
          </div>
        ) : error ? (
          <div>
            <p className="error-text">{error}</p>
            <button
              type="button"
              className="btn btn-subtle"
              style={{ marginTop: "12px" }}
              onClick={() => setRetryKey((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <h3>No groups yet</h3>
            <p>Create your first group to start splitting expenses.</p>
          </div>
        ) : (
          <div className="group-list stagger">
            {groups.map((group) => (
              <div key={group._id} className="group-card-wrap">
                <button
                  type="button"
                  className="group-card"
                  onClick={() => onSelectGroup(group)}
                >
                  <div className="group-card-top">
                    <strong className="group-name">{group.name}</strong>
                    <span className="group-arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <div className="mini-chip-row">
                    {group.members.map((m) => (
                      <span key={m} className="mini-chip">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="group-created">
                    Created {fmtDateTime(group.createdAt)}
                  </p>
                </button>
                <button
                  type="button"
                  className="group-delete"
                  aria-label={`Delete group ${group.name}`}
                  onClick={() => setDeleteTarget(group)}
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
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete group?"
        message={`"${deleteTarget?.name || ""}" will be permanently deleted along with all of its expenses.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default Groups;
