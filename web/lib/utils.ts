import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const apiClient = axios.create({
  baseURL: "http://api.localhost/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // Increased to 120s for long evaluations
});

// Add a request interceptor to attach the token dynamically
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
