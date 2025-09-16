// client/src/api/api.js
import axios from "axios";

// ✅ Always point at your backend
const API_BASE = "http://localhost:5000/api";

/* ---------------- AUTH ---------------- */
export async function loginUser(credentials) {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, credentials);
    return res.data;
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Login failed");
  }
}

export async function registerUser(credentials) {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, credentials);
    return res.data;
  } catch (err) {
    console.error("❌ Register failed:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Registration failed");
  }
}

/* ---------------- DOCUMENTS ---------------- */
export async function getDocuments(token) {
  try {
    const res = await axios.get(`${API_BASE}/docs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ Fetch documents failed:", err.response?.data || err.message);
    return []; // safe fallback
  }
}

export async function addDocument(doc, token) {
  try {
    const res = await axios.post(`${API_BASE}/docs`, doc, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Add document failed:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Failed to create document");
  }
}

/* ---------------- Q&A ---------------- */
export async function askQuestion(question, token) {
  try {
    const res = await axios.post(
      `${API_BASE}/qna`,
      { question },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    console.error("❌ QnA request failed:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Failed to get answer");
  }
}

/* ---------------- SEMANTIC SEARCH (AI) ---------------- */
export async function searchDocs(query, token) {
  try {
    const res = await axios.get(`${API_BASE}/ai/search`, {
      params: { q: query },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // ✅ Always return array
    if (res.data?.error) {
      console.warn("⚠️ AI backend error:", res.data.error);
      return [];
    }
    return Array.isArray(res.data?.results) ? res.data.results : [];
  } catch (err) {
    console.error("❌ Search API failed:", err.response?.data || err.message);
    return []; // safe fallback (instead of crashing UI)
  }
}