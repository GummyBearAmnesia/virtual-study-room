import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  // TODO: TEST THIS FILE?

  const navigate = useNavigate();

  // fields that the user will input
  const [formData, setFormData] = useState({ username: "", password: "" });

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
        formData
      );

      // store tokens in localStorage
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      alert("Login successful!");
      navigate("/dashboard"); // redirect to the dashboard after login
    } catch (error) {
      setError("Invalid username or password!");
    }
    console.log(formData);
  };

  return (
    <div className="login-container">
      <h1 className="heading1">The Study Spot</h1>
      <form className="login-form">
        <h1 className="heading2">Login</h1>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Show error if login fails */}
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
        <button type="button" className="submit-button" onClick={handleLogin}>
          LOGIN
        </button>
      </form>
    </div>
  );
}

export default Login;
