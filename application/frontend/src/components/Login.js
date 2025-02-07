import React, { useState } from "react";
import "./Login.css";

function Login() {
    // TODO: CHECK WHAT THESE DO
    // TODO: TEST THIS FILE?
    const [formData, setFormData] = useState({ username: "", password: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="login-container">
        <h1 className="heading1">The Study Spot</h1>
        <form className="login-form">
            <h1 className="heading2">Login</h1>
            <label className="username-text">Username:</label>
            <input
            type="text"
            name="username"
            className="username-field"
            value={formData.username}
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

            <button type="button" className="submit-button">LOGIN</button>
        </form>
        </div>
    );
}

export default Login;
