import React, { useState, useEffect } from 'react';
import axios from "axios"
import { Navigate, useNavigate } from 'react-router-dom';
import "../styles/Login.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuthenticatedRequest, getAccessToken } from "./utils/authService";
import { v4 as uuidv4 } from "uuid";  // For generating unique Tab IDs



function Login() {
    const navigate = useNavigate();

    // Generate or retrieve the unique Tab ID
    useEffect(() => {
        let tabId = sessionStorage.getItem("tab_id");
        if (!tabId) {
            tabId = uuidv4();  // Generate a new unique ID for this tab
            sessionStorage.setItem("tab_id", tabId);
        }

        // Check if an access token exists for this tab
        const storedToken = localStorage.getItem(`access_token_${tabId}`);
        if (storedToken) {
            navigate("/dashboard");  // Redirect authenticated users
        }
    }, [navigate]);

    // User login form fields
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    // To retrieve the username
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const data = await getAuthenticatedRequest("/profile/", "GET");
                setUserName(data.username || "N/A");
            } catch (error) {
                toast.error("Error fetching user data");
            }
        };
        fetchUserName();
    }, []);

    // Update form data when input fields change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle login logic
    const handleLogin = async () => {
        setError("");
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login/",
                formData,
                { headers: { "Content-Type": "application/json" } }
            );

            // Get the unique Tab ID
            const tabId = sessionStorage.getItem("tab_id");

            // Store tokens and user ID in localStorage with the Tab ID
            localStorage.setItem(`access_token_${tabId}`, response.data.access);
            localStorage.setItem(`refresh_token_${tabId}`, response.data.refresh);
            localStorage.setItem(`user_id_${tabId}`, response.data.userId);

            toast.success("Login Successful!", { hideProgressBar: true });

            setTimeout(() => {
                navigate(`/dashboard/${userName}`, { state: { userName } });
            }, 1500);
            
        } catch (error) {
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("An error occurred. Please try again.");
            }
        }
    };


    return (
        <div className="login-container">
        <ToastContainer position='top-center'/>
        <h1 className="login-heading1">The Study Spot</h1>
        <form className="login-form">
            <h1 className="login-heading2">Login</h1>

            {error && <p className="error-message">{error}</p>} {/* Show error if login fails */}

            <label className="username-text">Email:</label>
            <input
            type="text"
            name="email"
            className="username-field"
            value={formData.email}
            onChange={handleChange}
            />

            <label className="password-text">Password:</label>
            <input
            type="password"
            name="password"
            className="password-field"
            value={formData.password}
            onChange={handleChange}
            />

            <button type="button" className="login-submit-button" onClick={handleLogin}>LOGIN</button>
        </form>
        </div>
    );
}

export default Login;
