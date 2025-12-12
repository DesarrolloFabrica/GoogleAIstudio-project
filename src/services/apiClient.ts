// src/services/apiClient.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"; 
// AJUSTA este puerto al que realmente use tu backend Nest

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient;
