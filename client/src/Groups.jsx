import { useState, useEffect } from "react";
import api from "./api";
import { fmtDateTime } from "./format";

function Groups({ user, onSelectGroup, reloadKey }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api.get(`/groups?userId=${user.id}`).then((res) => setGroups(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

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
                <p className="group-created">
                  Created {fmtDateTime(group.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Groups;
