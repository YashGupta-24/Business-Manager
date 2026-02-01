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
    // 🔍 CHECK FOR TOKEN ON LOAD
    const token = localStorage.getItem("token");
    const businessId = localStorage.getItem("businessId");
    
    if (token && businessId) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear token
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