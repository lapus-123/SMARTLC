import axios from "axios";

// ⚠️ Replace with your computer's local IP when testing with Expo Go
// e.g., http://192.168.1.5:5000  (NOT localhost)
const BASE_URL = "http://192.168.1.25:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export default api;
