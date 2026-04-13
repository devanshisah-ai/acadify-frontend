import axios from 'axios';

let isRedirecting = false;

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// Attach token if exists (handles page refresh)
const storedToken = localStorage.getItem("token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong";
    const url = error.config?.url || "";

    const isAuthMe = url.includes("/auth/me");
    const isLoginRoute = url.includes("/auth/login"); // 👈 ADDED
    const tokenExists = !!localStorage.getItem("token");

    if (status === 401 && !isAuthMe && !isLoginRoute && !isRedirecting && !tokenExists) {
      isRedirecting = true;
      console.error("API ERROR:", message);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;