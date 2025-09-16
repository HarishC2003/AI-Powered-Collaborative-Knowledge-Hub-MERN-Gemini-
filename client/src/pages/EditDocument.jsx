import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function EditDocument() {
  const { id } = useParams(); // get :id from URL
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch document data
  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/docs/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTitle(res.data.title || "");
        setContent(res.data.content || "");
        setSummary(res.data.summary || "No summary available");
        setTags(res.data.tags || []);
      } catch (err) {
        setError(err.response?.data?.error || "❌ Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id, token]);

  // Save updated document
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/docs/${id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Document updated successfully!");
      navigate("/"); // Redirect back to dashboard
    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>⏳ Loading document...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "40px auto",
        padding: "24px",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "16px" }}>✏️ Edit Document</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      {/* Existing info */}
      <div style={{ marginBottom: "20px", fontSize: "14px", color: "#374151" }}>
        <p><strong>Current Summary:</strong> {summary}</p>
        <p>
          <strong>Current Tags:</strong>{" "}
          {tags.length > 0 ? tags.join(", ") : "No tags available"}
        </p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Title */}
        <div>
          <label style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: "4px" }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Content */}
        <div>
          <label style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: "4px" }}>
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              flex: 1,
              padding: "12px",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}