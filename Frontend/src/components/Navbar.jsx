import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const location = useLocation();
  const businessName = localStorage.getItem("businessName") || "Business";

  // Helper to determine active link style
  const linkClass = (path, isMobile = false) => {
    const base = "font-medium transition-colors duration-200";
    const active = "text-primary bg-indigo-50";
    const inactive = "text-gray-600 hover:text-primary hover:bg-gray-50";
    
    // Mobile needs block display and more padding
    const mobileStyles = isMobile ? "block px-4 py-3 rounded-lg text-base" : "px-4 py-2 rounded-lg text-sm";

    return `${base} ${mobileStyles} ${location.pathname === path ? active : inactive}`;
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LEFT: Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
              {businessName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-dark leading-tight">{businessName}</span>
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Manager</span>
            </div>
          </div>

          {/* CENTER: Desktop Menu (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={linkClass("/")}>Billing Terminal</Link>
            <Link to="/inventory" className={linkClass("/inventory")}>Inventory</Link>
          </div>

          {/* RIGHT: Desktop Logout (Hidden on Mobile) */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={onLogout}
              className="text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              Logout
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>

          {/* RIGHT: Mobile Hamburger Button (Visible only on Mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? (
                // Close Icon (X)
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Menu Icon (Hamburger)
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN (Conditionally Rendered) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className={linkClass("/", true)} 
              onClick={() => setIsOpen(false)} // Close menu on click
            >
              Billing Terminal
            </Link>
            <Link 
              to="/inventory" 
              className={linkClass("/inventory", true)} 
              onClick={() => setIsOpen(false)}
            >
              Inventory Management
            </Link>
            
            <div className="border-t border-gray-100 my-2 pt-2">
              <button
                onClick={() => { setIsOpen(false); onLogout(); }}
                className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;