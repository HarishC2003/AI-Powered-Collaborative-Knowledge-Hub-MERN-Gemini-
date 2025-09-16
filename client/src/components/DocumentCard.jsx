import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function DocumentCard({ doc, refreshDocs }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const navigate = useNavigate();

  // Safe data
  const title = doc?.title || "Untitled";
  const summary = doc?.summary || "No summary available";
  const tags = Array.isArray(doc?.tags) ? doc.tags : [];
  const author = doc?.createdBy?.name || "Unknown";
  const createdAt = doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "";

  // Summarize
  const handleSummarize = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/docs/${doc._id}/summarize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshDocs?.();
    } catch (err) {
      console.error("Summarize error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate Tags
  const handleTags = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/docs/${doc._id}/tags`,
        {},
        { headers: { Authorization: `Bearer ${token}` } 
      });
      refreshDocs?.();
    } catch (err) {
      console.error("Tag generation error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Versions for History
  const handleHistory = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/versions/${doc._id}`,
        { headers: { Authorization: `Bearer ${token}` } 
      });
      setVersions(Array.isArray(res.data) ? res.data : []);
      setShowHistory(true);
    } catch (err) {
      console.error("Error fetching versions:", err);
      // keep UI usable even if history fails
      setVersions([]);
      setShowHistory(true);
    }
  };

  // Backdrop close for modal
  const closeHistory = () => setShowHistory(false);

  // Styles
  const styles = {
    card: {
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "20px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      // Ensure card content width is respected
      minHeight: "210px",
    },
    title: { fontSize: "1.2rem", fontWeight: 600, margin: "0 0 6px 0", color: "#111827" },
    summary: { color: "#374151", fontSize: "0.95rem" },
    tagsContainer: { display: "flex", flexWrap: "wrap", gap: "8px" },
    tag: {
      backgroundColor: "#e0f2fe",
      color: "#0369a1",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: "500",
    },
    meta: { fontSize: "0.8rem", color: "#6b7280" },
    // Buttons: responsive wrap
    buttonRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "8px",
      marginTop: "6px",
    },
    button: {
      padding: "10px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      color: "#fff",
    },
    buttonPrimary: { backgroundColor: "#3b82f6" },
    buttonSecondary: { backgroundColor: "#6b7280" },
    buttonEdit: { backgroundColor: "#059669" },
    buttonHistory: { backgroundColor: "#8b5cf6" },
    buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },

    // History modal
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      padding: "12px",
    },
    modal: {
      background: "#fff",
      padding: "20px",
      borderRadius: "8px",
      width: "90%",
      maxWidth: "640px",
      maxHeight: "75vh",
      overflowY: "auto",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    },
    closeBtn: {
      marginTop: "12px",
      padding: "10px 14px",
      borderRadius: "6px",
      border: "none",
      background: "#ef4444",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
    },
    versionItem: {
      borderBottom: "1px solid #eee",
      padding: "8px 0",
    },
  };

  // small helper
  const actionIcon = (a) => {
    switch (a) {
      case "created": return "🆕";
      case "edited": return "✏️";
      case "deleted": return "🗑️";
      case "summarized": return "🧠";
      case "retagged": return "🏷️";
      default: return "ℹ️";
    }
  };

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleString(); } catch { return ""; }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.summary}>{summary}</p>

      <div style={styles.tagsContainer}>
        {tags.length > 0 ? tags.map((t, i) => <span key={i} style={styles.tag}>{t}</span>) : (
          <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>No tags available</span>
        )}
      </div>

      <div style={styles.meta}>
        By <strong>{author}</strong> {createdAt && " · " + createdAt}
      </div>

      <div style={styles.buttonRow}>
        <button style={{ ...styles.button, ...styles.buttonDefault, ...styles.buttonPrimary }} onClick={handleSummarize} disabled={loading}>
          Summarize
        </button>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={handleTags} disabled={loading}>
          Generate Tags
        </button>
        <button style={{ ...styles.button, ...styles.buttonEdit }} onClick={() => navigate(`/edit/${doc._id}`)} disabled={loading}>
          Edit
        </button>
        <button style={{ ...styles.button, ...styles.buttonHistory }} onClick={handleHistory}>
          History
        </button>
      </div>

      {showHistory && (
        <div style={styles.modalOverlay} onClick={closeHistory}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>📜 Version History</h3>
            {versions.length === 0 ? (
              <p>No history available.</p>
            ) : (
              versions.map((v, idx) => (
                <div key={idx} style={styles.versionItem}>
                  <div><strong>Title:</strong> {v.title}</div>
                  <div><strong>Summary:</strong> {v.summary || "N/A"}</div>
                  <div><small>Edited At: {fmtDate(v.editedAt)} by {v.editedBy?.name || "Unknown"}</small></div>
                </div>
              ))
            )}
            <button style={styles.closeBtn} onClick={closeHistory}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentCard;