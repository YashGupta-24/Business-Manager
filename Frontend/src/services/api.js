import axios from "axios";

const API_URL = "http://localhost:9090/api";

// 1. Create a Custom Axios Instance
const api = axios.create({
    baseURL: API_URL,
});

// 2. The Interceptor (The "Stamper")
// Before ANY request leaves the browser, this function runs.
api.interceptors.request.use((config) => {
    // It grabs the Business ID we saved during Login
    const businessId = localStorage.getItem("businessId");
    
    // If it exists, it stamps it onto the Request Header
    if (businessId) {
        config.headers["X-Business-Id"] = businessId;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

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