import axios from "axios";

const API_URL = "http://localhost:9090/api";

// 1. Create a Custom Axios Instance
const api = axios.create({
    baseURL: API_URL,
});

// VERY IMPORTANT: This tells Axios to ALWAYS send cookies with every request
api.defaults.withCredentials = true;

// 2. The Interceptor (The "Stamper")
api.interceptors.request.use((config) => {
    // We NO LONGER get the token from localStorage or attach an Authorization header
    // The browser will automatically attach the 'jwt' HttpOnly cookie we created
    
    // We can still pass businessId if needed by some specific endpoints, 
    // but our backend now extracts it from the cookie.
    const businessId = localStorage.getItem("businessId");
    
    if (businessId) {
        config.headers["X-Business-Id"] = businessId;
    }
    
    return config;
}, (error) => Promise.reject(error));

// 3. Updated API Calls (Using 'api' instead of 'axios')
export const getItems = () => api.get("/items/all");
export const addItem = (item) => api.post("/items/add", item);
export const deleteItem = (id) => api.delete(`/items/delete/${id}`);

// Note: params are handled cleanly here
export const addStock = (id, quantity) => 
    api.put(`/items/${id}/stock-in`, null, { params: { quantity } });

export const createOrder = (order) => api.post("/orders/create", order);
export const finalizeOrder = (id) => api.post(`/orders/${id}/finalize`);

// PDF Download needs specific response type
export const downloadInvoice = (id) => 
    api.get(`/orders/${id}/pdf`, { responseType: 'blob' });

// (Optional) Login/Signup helper if you want to centralize auth
export const login = (creds) => api.post("/auth/login", creds);
export const signup = (data) => api.post("/auth/signup", data);
export const logout = () => api.post("/auth/logout");