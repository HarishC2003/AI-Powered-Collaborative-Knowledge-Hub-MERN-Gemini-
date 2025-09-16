import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { askQuestion } from "../api/api";
import "../styles/QA.css";

export default function QA() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setAnswer("");
    setError("");
    setLoading(true);

    try {
      const res = await askQuestion(question, token);

      if (res.answer) {
        setAnswer(res.answer.trim());
      } else if (res.error) {
        setError(res.error);
      } else {
        setError("No response from server.");
      }
    } catch (err) {
      const msg =
        typeof err === "string" ? err :
        err.response?.data?.error ||
        "An unexpected error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qa-container">
      <h2 className="qa-title">🤖 Team Q&amp;A</h2>
      <p className="qa-subtitle">
        Ask Gemini a question based on your stored documents.
      </p>

      <form onSubmit={handleAsk} className="qa-form">
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="qa-input"
        />
        <button
          type="submit"
          className="qa-button"
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {answer && (
        <div className="qa-card">
          <h3>Answer</h3>
          <p>{answer}</p>
        </div>
      )}

      {error && (
        <div className="qa-error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
