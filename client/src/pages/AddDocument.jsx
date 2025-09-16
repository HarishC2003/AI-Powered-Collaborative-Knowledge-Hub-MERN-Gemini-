import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { addDocument } from "../api/api";
import "../styles/AddDocument.css";

export default function AddDocument() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doc = await addDocument({ title, content }, token);

      alert(
        `✅ Document saved successfully!\n\nSummary:\n${doc.summary || "N/A"}\n\nTags: ${doc.tags?.join(", ") || "none"}`
      );

      navigate("/"); // back to dashboard
    } catch (err) {
      console.error("Failed to add document:", err);
      alert("❌ Error adding document: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adddoc-page">
      <div className="adddoc-container">
        <div className="adddoc-card">
          <form onSubmit={handleSubmit} className="adddoc-form">
            <div>
              <h1 className="adddoc-header">Create a New Document</h1>
              <p className="adddoc-subheader">
                Fill in the details below to add your new document.
              </p>
            </div>

            <div className="adddoc-group">
              <label htmlFor="title" className="adddoc-label">
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Document Title"
                className="adddoc-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="adddoc-group">
              <label htmlFor="content" className="adddoc-label">
                Content
              </label>
              <textarea
                id="content"
                placeholder="Start writing your content here..."
                className="adddoc-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="adddoc-actions">
              <button
                type="button"
                className="adddoc-button cancel"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="adddoc-button save"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
