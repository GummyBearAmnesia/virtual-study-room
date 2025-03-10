import axios from "axios";
import { jwtDecode } from "jwt-decode";


const API_BASE_URL = "https://studyspot.pythonanywhere.com/api/"
//"http://127.0.0.1:8000/api"; // Change if needed

// Local storage helpers (can be mocked in tests)
export const storage = {
    getAccessToken: () => localStorage.getItem("access_token"),
    getRefreshToken: () => localStorage.getItem("refresh_token"),
    setTokens: (access, refresh) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
    },
    clearTokens: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
};

// Token utilities
export const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
};

// Refresh token function
export const refreshToken = async (httpClient = axios) => {
    const refresh = storage.getRefreshToken();
    if (!refresh) return null;

    try {
        const response = await httpClient.post(`${API_BASE_URL}/token/refresh/`, { refresh });

        storage.setTokens(response.data.access, response.data.refresh);
        return response.data.access;
    } catch (error) {
        storage.clearTokens();
        throw new Error("Failed to refresh token");
    }
};

// Authenticated request helper
export const getAuthenticatedRequest = async (url, method = "GET", data = null, httpClient = axios) => {
    let token = storage.getAccessToken();

    if (!token || isTokenExpired(token)) {
        token = await refreshToken(httpClient);
        if (!token) throw new Error("Authentication failed, please log in again.");
    }

    try {
        const response = await httpClient({
            method,
            url: `${API_BASE_URL}${url}`,
            headers: { Authorization: `Bearer ${token}` },
            data
        });

        return response.data;
    } catch (error) {
        throw new Error(`Error making request to ${url}: ${error.message}`);
    }
};
