import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "https://studyspot.pythonanywhere.com/api/"
//"http://127.0.0.1:8000/api"; // Change if needed

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

// Logout function - Clears storage and redirects to login page
const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login"; // Redirect user to login page
};

export const refreshToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh || isTokenExpired(refresh)) {
        //console.warn("Refresh token is expired or missing. Logging out.");
        logoutUser();
        return null;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refresh,  // Sending the refresh token in the body
        });

        // Store new tokens
        localStorage.setItem("access_token", response.data.access);
        if (response.data.refresh) {
            localStorage.setItem("refresh_token", response.data.refresh);
        }

        return response.data.access;
    } catch (error) {
        console.error("Error refreshing token:", error.response?.data || error.message);
        logoutUser();
        return null;
    }
};


// Function to get an authenticated request
export const getAuthenticatedRequest = async (url, method = "GET", data = null) => {
    let token = getAccessToken();

    if (!token || isTokenExpired(token)) {
        token = await refreshToken();
        if (!token) throw new Error("Authentication failed, please log in again.");
    }

    try {
        const headers = { Authorization: `Bearer ${token}` };
        const config = { method, url: `${API_BASE_URL}${url}`, headers, data };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`Error making authenticated request to ${url}:`, error);
        if (error.response && error.response.status === 401) {
            logoutUser();
        }
        throw error;
    }
};
