import React, { useState } from "react";
import "../styles/Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {

    //fields that the user will input
    const [formData, setFormData] = useState({ firstname: "", lastname: "", email: "", username: "", password: "", passwordConfirmation: "", acceptTerms: false });

    //when the username/password fields are edited, update form data
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
        //setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //when the signup button is clicked - send form data to backend django form
    const handleSignup = async () => {
        if (!formData.acceptTerms) {
            alert("You must accept the terms and conditions.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/signup/", formData, {
                headers: { "Content-Type": "application/json" }
            });

            alert(response.data.message); // Show success message
        } catch (error) {
            if (error.response) {
                alert(error.response.data.error); // Show error from backend
            } else {
                console.error("Signup error:", error);
                alert("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <h1 className="heading1">The Study Spot</h1>
            <form className="signup-form">
                <h1 className="heading2">Signup</h1>
                <label className="username-text">First name:</label>
                <input
                    type="text"
                    name="firstname"
                    className="username-field"
                    value={formData.firstname}
                    onChange={handleChange}
                />

                <label className="username-text">Last name:</label>
                <input
                    type="text"
                    name="lastname"
                    className="username-field"
                    value={formData.lastname}
                    onChange={handleChange}
                />

                <label className="username-text">Username:</label>
                <input
                    type="text"
                    name="username"
                    className="username-field"
                    value={formData.username}
                    onChange={handleChange}
                />

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

                <label className="password-text">Confirm password:</label>
                <input
                    type="password"
                    name="passwordConfirmation"
                    className="password-field"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                />

                <div className="checkbox-container">
                    <input type="checkbox" name="acceptTerms" id="acceptTerms"
                        checked={formData.acceptTerms} onChange={handleChange} />
                    <label htmlFor="acceptTerms" className="checkbox-label">
                        I accept the <a href="#">terms and conditions</a>
                    </label>
                </div>

                <button type="button" className="submit-button" onClick={handleSignup}>SIGNUP</button>
            </form>
        </div>
    );
}

export default Signup;
