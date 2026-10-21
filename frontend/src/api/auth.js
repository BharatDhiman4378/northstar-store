import api from "./axios";

const ACCESS_TOKEN_KEY = "northstar_access";
const REFRESH_TOKEN_KEY = "northstar_refresh";

export async function login(email, password) {
  const response = await api.post("auth/login/", {
    email,
    password,
  });

  const { access, refresh } = response.data;

  if (!access || !refresh) {
    throw new Error("Authentication tokens were not returned.");
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, access);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);

  return true;
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

//Refresh Token
export async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    clearTokens();
    throw new Error("No refresh token available.");
  }

  try {
    const response = await api.post("auth/token/refresh/", {
      refresh,
    });

    const { access, refresh: rotatedRefresh } = response.data;

    if (!access) {
      throw new Error("The server did not return an access token.");
    }

    sessionStorage.setItem(ACCESS_TOKEN_KEY, access);

    // Your backend rotates refresh tokens, so save the new one.
    if (rotatedRefresh) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, rotatedRefresh);
    }

    return access;
  } catch (error) {
    clearTokens();
    throw error;
  }
}

//Logout Function
export async function logout() {
  const refresh = getRefreshToken();

  try {
    if (refresh) {
      const { default: authenticatedApi } = await import(
        "../api/Authenticated"
      );

      await authenticatedApi.post("auth/logout/", { refresh });
    }
  } finally {
    clearTokens();
    window.location.replace("/login");
  }
}