// src/services/apiClient.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

console.log("API_BASE_URL =", API_BASE_URL); // <-- esto para comprobar

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient;
