import { useState, useEffect } from "react";
import api from "./api";

function Groups({ user, onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [membersInput, setMembersInput] = useState("");

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchGroups() {
    const res = await api.get(`/groups?userId=${user.id}`);
    setGroups(res.data);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const members = membersInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    await api.post("/groups", {
      name,
      members,
      createdBy: user.id,
    });

    setName("");
    setMembersInput("");
    fetchGroups();
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
          <h2 className="display-sm">Create a group</h2>
        </div>
        <form onSubmit={handleCreateGroup} className="card form-grid">
          <input
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
            className="text-input full"
            value={membersInput}
            onChange={(e) => setMembersInput(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Create group
          </button>
        </form>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="display-sm">Your groups</h2>
        </div>
        {groups.length === 0 ? (
          <div className="empty-state">
            <h3>No groups yet</h3>
            <p>Create your first group to start splitting expenses.</p>
          </div>
        ) : (
          <div className="group-list stagger">
            {groups.map((group) => (
              <button
                key={group._id}
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
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Groups;
