import React, { useState } from "react";
import "../styles/Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Signup() {

    //fields that the user will input
    const [formData, setFormData] = useState({ firstname: "", lastname: "", email: "", username: "", password: "", passwordConfirmation: "", acceptTerms: false });
    const navigate = useNavigate();

    //when the fields are edited, update form data
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
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
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                alert(error.response.data.error); 
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
                <label htmlFor="firstname" className="firstname-text">First name:</label>
                <input
                    id= "firstname"
                    type="text"
                    name="firstname"
                    className="firstname-field"
                    value={formData.firstname}
                    onChange={handleChange}
                />

                <label htmlFor="lastname" className="lastname-text">Last name:</label>
                <input
                    id="lastname"
                    type="text"
                    name="lastname"
                    className="lastname-field"
                    value={formData.lastname}
                    onChange={handleChange}
                />

                <label htmlFor="username" className="username-text">Username:</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    className="username-field"
                    value={formData.username}
                    onChange={handleChange}
                />

                <label htmlFor="email" className="email-text">Email:</label>
                <input
                    id="email"
                    type="text"
                    name="email"
                    className="email-field"
                    value={formData.email}
                    onChange={handleChange}
                />

                <label htmlFor="password" className="password-text">Password:</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    className="password-field"
                    value={formData.password}
                    onChange={handleChange}
                />

                <label htmlFor="passwordConfirmation" className="password-text">Confirm password:</label>
                <input
                    id="passwordConfirmation"
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
