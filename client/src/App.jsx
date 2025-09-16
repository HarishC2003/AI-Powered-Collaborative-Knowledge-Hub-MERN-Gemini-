// src/App.js
import React, { useContext } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddDocument from "./pages/AddDocument";
import Search from "./pages/Search";
import QA from "./pages/QA";
import EditDocument from "./pages/EditDocument";
import { AuthContext } from "./context/AuthContext";
import "./styles/App.css"; // optional global App-specific styles

// Wrapper for private routes
function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="app-navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link">Dashboard</Link>

          {user && (
            <>
              <Link to="/add" className="nav-link">Add Document</Link>
              <Link to="/search" className="nav-link">Search</Link>
              <Link to="/qa" className="nav-link">Q&A</Link>
            </>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <span className="divider">|</span>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Routes */}
      <main className="app-main">
        <Routes>
          {/* Private Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute user={user}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add"
            element={
              <PrivateRoute user={user}>
                <AddDocument />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute user={user}>
                <EditDocument />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute user={user}>
                <Search />
              </PrivateRoute>
            }
          />
          <Route
            path="/qa"
            element={
              <PrivateRoute user={user}>
                <QA />
              </PrivateRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
