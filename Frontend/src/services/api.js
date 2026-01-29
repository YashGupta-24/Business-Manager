import axios from "axios";

// Remember: We moved to port 9090 for the backend!
const API_URL = "http://localhost:9090/api";

export const getItems = () => axios.get(`${API_URL}/items/all`);
export const addItem = (item) => axios.post(`${API_URL}/items/add`, item);
export const createOrder = (order) => axios.post(`${API_URL}/orders/create`, order);
export const finalizeOrder = (id) => axios.post(`${API_URL}/orders/${id}/finalize`);
export const downloadInvoice = (id) => axios.get(`${API_URL}/orders/${id}/pdf`, { responseType: 'blob' });