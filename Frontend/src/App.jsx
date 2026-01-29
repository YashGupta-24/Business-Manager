import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing"; // We will create this next!

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light font-sans text-dark">
        <Navbar />
        <Routes>
          <Route path="/" element={<Billing />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;