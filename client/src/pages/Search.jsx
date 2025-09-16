// src/pages/Search.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getDocuments, searchDocs } from "../api/api";
import "../styles/search.css";

export default function Search() {
  const [query, setQuery] = useState("");
  const [keywordResults, setKeywordResults] = useState([]);
  const [semanticResults, setSemanticResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);
    setKeywordResults([]);
    setSemanticResults([]);

    try {
      // --------------------
      // 1️⃣ Keyword search
      // --------------------
      const docs = await getDocuments(token);
      const keywordMatches = docs.filter(
        (d) =>
          d.title?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          d.content?.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          d.summary?.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      setKeywordResults(keywordMatches);

      // --------------------
      // 2️⃣ Semantic search
      // --------------------
      const semRes = await searchDocs(trimmedQuery, token);

      // Normalize results to ensure frontend can read them
      const normalizedSemantic = (semRes?.results || semRes || []).map((r) => ({
        title: r.title || "Untitled",
        snippet: r.snippet || r.content?.slice(0, 150) || "No snippet available",
      }));

      setSemanticResults(normalizedSemantic);
    } catch (err) {
      console.error("Search error:", err);
      setError("Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h2 className="search-title">🔍 Search Documents</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && <p className="search-loading">Searching...</p>}
      {error && <p className="search-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Keyword Matches */}
          <div className="search-section">
            <h3 className="section-title">📄 Keyword Matches</h3>
            {keywordResults.length === 0 ? (
              <p className="empty">No keyword matches.</p>
            ) : (
              keywordResults.map((doc) => (
                <div key={doc._id} className="search-card">
                  <h4 className="search-card-title">{doc.title || "Untitled"}</h4>
                  <p className="search-card-snippet">
                    {doc.summary || (doc.content ? doc.content.slice(0, 120) + "..." : "No preview available")}
                  </p>
                  <small style={{ color: "#777" }}>
                    By {doc.createdBy?.name || "Unknown"} ·{" "}
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                  </small>
                </div>
              ))
            )}
          </div>

          {/* Semantic Matches */}
          <div className="search-section">
            <h3 className="section-title">🤖 Semantic Matches</h3>
            {semanticResults.length === 0 ? (
              <p className="empty">No semantic matches.</p>
            ) : (
              semanticResults.map((r, idx) => (
                <div key={idx} className="search-card">
                  <h4 className="search-card-title">{r.title}</h4>
                  <p className="search-card-snippet">{r.snippet}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
