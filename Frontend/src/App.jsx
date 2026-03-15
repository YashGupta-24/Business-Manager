import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Login from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Prevent flickering

  useEffect(() => {
    // 🔍 CHECK FOR AUTH ON LOAD
    // Because the JWT is an HttpOnly cookie, we can't read it here.
    // Instead, we check if we have a businessId stored. 
    // If the cookie is expired, the backend will return a 401 on the first API call anyway.
    const businessId = localStorage.getItem("businessId");
    
    if (businessId) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // 1. Tell backend to delete the cookie
    import('./services/api').then(({ logout }) => {
      logout().catch(err => console.error("Logout failed", err));
    });
    // 2. Clear local storage
    localStorage.clear(); 
    setIsAuthenticated(false);
  };

  if (isLoading) return <div className="p-10 text-center">Loading System...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-light font-sans text-dark">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={
             !isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />
          } />
          <Route path="/" element={isAuthenticated ? <Billing /> : <Navigate to="/login" />} />
          <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;