import React, { useState, useEffect } from 'react';
import axios from "axios"
import { Navigate, useNavigate } from 'react-router-dom';
import "../styles/Login.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuthenticatedRequest, getAccessToken } from "./utils/authService";

function Login() {
    // TODO: TEST THIS FILE?

    const navigate = useNavigate();

    // fields that the user will input
    const [formData, setFormData] = useState({ email: "", password: "" });

    // store login errors
    const [error, setError] = useState("");

    // when the username/password fields are edited, update form data
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // when the login button is clicked - send form data to backend django form
    const handleLogin = async () => {
        setError("");
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login/",
                formData,  // Contains email and password
                { headers: { "Content-Type": "application/json" } }  // No Authorization header here
            );

            // Store tokens in localStorage
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
            localStorage.setItem('user_id', response.data.userId);

            toast.success("Login Successful!", {
                hideProgressBar: true
            });

            console.log(" Logging in: ", response.data.username)
            setTimeout(() => {
                navigate(`/dashboard/${response.data.username}`, {
                        state: { userName: response.data.username },
      });
            }, 1500)

        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("An error occurred. Please try again.")
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
