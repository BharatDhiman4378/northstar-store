import axios from "axios";
import {getAccessToken, refreshAccessToken, clearTokens,} from "../api/auth";

const authenticatedApi = axios.create({
  baseURL: "http://127.0.0.1:8001/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: "http://127.0.0.1:8001/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

authenticatedApi.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});


let refreshPromise = null;

authenticatedApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("auth/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    // If there is no refresh token, don't try to refresh.
    // Public pages such as Products must remain accessible.
    const refreshToken = sessionStorage.getItem("northstar_refresh");

    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return authenticatedApi(originalRequest);
    } catch (refreshError) {
      clearTokens();

      // Redirect only when the current page actually requires login.
      const protectedPaths = ["/home", "/cart"];
      const requiresLogin = protectedPaths.some(
        (path) =>
          window.location.pathname === path ||
          window.location.pathname.startsWith(`${path}/`)
      );

      if (requiresLogin && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    }
  }
);

export default authenticatedApi;