import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { getDocuments } from "../api/api.js";
import { AuthContext } from "../context/AuthContext";
import DocumentCard from "../components/DocumentCard";
import "../styles/global.css";

export default function Dashboard() {
  const { token } = useContext(AuthContext);

  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState(null);

  const [activity, setActivity] = useState([]);
  const [actLoading, setActLoading] = useState(true);
  const [actError, setActError] = useState(null);

  // Tag filtering
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch documents
  async function fetchDocs() {
    setDocsLoading(true);
    setDocsError(null);
    try {
      const data = await getDocuments(token);
      setDocs(data);
    } catch (err) {
      setDocsError(err.message || "Error fetching documents");
    } finally {
      setDocsLoading(false);
    }
  }

  // Fetch activity feed (last 5)
  async function fetchActivity() {
    setActLoading(true);
    setActError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivity(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (err) {
      setActError(err.response?.data?.error || "Error fetching activity");
    } finally {
      setActLoading(false);
    }
  }

  // Fetch both on mount/token change
  useEffect(() => {
    fetchDocs();
    fetchActivity();
  }, [token]);

  // Refresh helper
  async function refreshAll() {
    await Promise.all([fetchDocs(), fetchActivity()]);
  }

  // All unique tags across docs
  const allTags = useMemo(() => {
    const s = new Set();
    docs.forEach((d) => (d.tags || []).forEach((t) => s.add(t)));
    return Array.from(s);
  }, [docs]);

  // Toggle a tag in the filter
  const toggleTag = (t) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((tag) => tag !== t) : [...prev, t]
    );
  };

  // Clear all filters
  const clearFilters = () => setSelectedTags([]);

  // Docs after filtering (AND logic)
  const filteredDocs = docs.filter((d) => {
    if (selectedTags.length === 0) return true;
    const dTags = d.tags || [];
    return selectedTags.every((t) => dTags.includes(t));
  });

  // Render
  return (
    <div className="dashboard-page" style={{ padding: 0 }}>
      <div className="header-row" style={ { display: "flex", justifyContent: "space-between", alignItems:"center", padding: "0 24px" } }>
        <h2 className="title" style={{ margin: "0 0 12px" }}>Documents</h2>
      </div>

      {docsLoading && <p>Loading documents...</p>}
      {docsError && <p className="error">{docsError}</p>}

      <div className="tags-bar" style={ { padding: "0 24px 8px" } }>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => toggleTag(t)}
            className={`tag-chip ${selectedTags.includes(t) ? "active" : ""}`}
            style={{ marginRight: 6, marginBottom:6 }}
          >
            {t}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button className="tag-chip" onClick={clearFilters} style={{ marginLeft: 6 }}>
            Clear
          </button>
        )}
      </div>

      <div className="layout" style={ { display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20, padding: "0 24px" } }>
        {/* Left: docs (filtered) */}
        <section className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} refreshDocs={refreshAll} />
          ))}
        </section>

        {/* Right: activity sidebar */}
        <aside className="sidebar" style={ { background: "#fff", borderRadius: 12, padding: 16, position: "sticky", top: 20, height: "fit-content" } }>
          <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 className="sidebar-title" style={{ margin: 0 }}>📢 Team Activity</h3>
            <button className="refresh-btn" onClick={refreshAll}>Refresh</button>
          </div>

          {actLoading && <p>Loading activity...</p>}
          {actError && <p className="error">❌ {actError}</p>}

          {!actLoading && !actError && (
            <>
              {activity.length === 0 ? (
                <p className="empty">No recent activity</p>
              ) : (
                activity.map((a, idx) => (
                  <div key={idx} className="activity-item" style={ { display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" } }>
                    <div className="activity-icon" style={ { width: 24, height: 24, borderRadius: "50%", background: "#eef2ff", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#4338ca", marginRight: 8 } }>
                      {["created","edited","deleted","summarized","retagged"].includes(a.action) ? "•" : "•"}
                    </div>
                    <div className="activity-text-wrap" style={{ flex:1 }}>
                      <div>
                        <strong>{a.by?.name || "Someone"}</strong> {a.action}{" "}
                        <span className="activity-title" style={ { color:"#2563eb", fontWeight:600 } }>{a.docId?.title || "a document"}</span>
                      </div>
                      <small style={ { color: "#6b7280" } }>{new Date(a.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}