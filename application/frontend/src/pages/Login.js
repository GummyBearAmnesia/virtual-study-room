import React, { useState } from "react";
import "../styles/Login.css";

function Login() {
    // TODO: TEST THIS FILE?

    //fields that the user will input
    const [formData, setFormData] = useState({ username: "", password: "" });

    //when the username/password fields are edited, update form data
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //when the login button is clicked - send form data to backend django form
    const handleLogin = async () => {
        console.log(formData);
    }

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

            <button type="button" className="submit-button" onClick={handleLogin}>LOGIN</button>
        </form>
        </div>
    );
}

export default Login;
