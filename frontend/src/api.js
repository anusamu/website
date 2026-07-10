import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Retained for cookie support
  headers: {
    "Content-Type": "application/json",
  },
});

// FIX: Automatically attach the token to every outgoing request header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // This matches your backend: authHeader.startsWith("Bearer ")
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;