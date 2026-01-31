import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const linkClass = (path) => 
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path 
      ? 'bg-primary shadow-md' 
      : 'text-muted hover:text-dark hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
          F
        </div>
        <span className="text-xl font-semibold text-dark tracking-tight">Business Manager</span>
      </div>
      
      <div className="flex gap-2">
        <Link to="/" className={linkClass("/")}>Billing Terminal</Link>
        <Link to="/inventory" className={linkClass("/inventory")}>Inventory</Link>
      </div>
    </nav>
  );
};

export default Navbar;