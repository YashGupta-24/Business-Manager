import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  // Changed 'username' to 'businessName'
  const [formData, setFormData] = useState({ businessName: "", password: "", address: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";

    try {
      // Direct call or use api.js
      const response = await axios.post(`http://localhost:9090/api${endpoint}`, formData);

      // Inside handleSubmit, in the success block:
      if (isLogin) {
        localStorage.setItem("businessName", response.data.businessName);
        localStorage.setItem("businessId", response.data.businessId);
        // We NO LONGER save the token to localStorage. 
        // The browser automatically received and stored the 'jwt' HttpOnly cookie.
        if (response.data.address) localStorage.setItem("address", response.data.address);

        setIsAuthenticated(true);
        navigate("/");
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-dark">
          {isLogin ? "Business Login" : "Register Business"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
            <input type="text" required className="w-full p-2 border rounded"
              placeholder="e.g. Gupta Traders"
              onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
          </div>

          {/* Show Address field only during Signup */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Address (For Bill)</label>
              <input type="text" className="w-full p-2 border rounded"
                placeholder="City, State"
                onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full p-2 border rounded"
              onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <button type="submit" className="w-full bg-primary py-2 rounded font-bold hover:bg-primaryHover transition">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500 cursor-pointer hover:text-primary"
          onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New Business? Register here" : "Already registered? Login"}
        </p>
      </div>
    </div>
  );
};

export default Login;