import React, { useState } from "react";
import "../styles/Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  //fields that the user will input
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    description: "",
    password: "",
    passwordConfirmation: "",
    acceptTerms: false,
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});


  const checkEmailExists = async (email) => {
    try {
      const { data } = await axios.get(
      "https://studyspot.pythonanywhere.com/api/check-email/",
//        `http://127.0.0.1:8000/api/check-email/`,
        {
          params: { email },
        }
      );
      return data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };

  const checkUsernameExists = async (username) => {
    try {
      const { data } = await axios.get(
      "https://studyspot.pythonanywhere.com/api/check-username/",
//        `http://127.0.0.1:8000/api/check-username/`,
        {
          params: { username },
        }
      );
      return data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  // validating the user input

  const validate = async () => {
    let newErrors = {};

    // checking if no fields are left empty
    if (!formData.firstname.trim()) {
      newErrors.firstname = "First Name is required";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last Name is required";
    }


    // using regex to check the username, email, and password are in the correct format
    const usernameRegex = /^@\w{3,}$/;
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username =
        "Username must consist of @ followed by at least three alphanumericals";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$/;
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain an uppercase character, a lowercase character, and a number.";
    } else if (
      formData.password.trim() !== formData.passwordConfirmation.trim()
    ) {
      newErrors.passwordConfirmation =
        "Password confirmation needs to match password";
    }

    // check if email and username are not already taken
    const exists = await checkEmailExists(formData.email);
    if (exists) {
      newErrors.email = "This email is already taken, please enter another";
    }

    const usernameExists = await checkUsernameExists(formData.username);
    if (usernameExists) {
      newErrors.username =
        "This username is already taken, please enter another";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //when the fields are edited, update form data
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  //when the signup button is clicked - send form data to backend django form
  const handleSignup = async () => {
    if (!formData.acceptTerms) {
      alert("You must accept the terms and conditions.");
      return;
    }

    try {
      const isValid = await validate();
      if (isValid) {
        const response = await axios.post(
        "https://studyspot.pythonanywhere.com/api/signup/",
//          "http://127.0.0.1:8000/api/signup/",
          formData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert(response.data.message);
        navigate("/dashboard");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="heading1">The Study Spot</h1>
      <form className="signup-form">
        <div className="field">
          <h1 className="heading2">Signup</h1>
          <label htmlFor="firstname" className="label-text">
            First name:
          </label>
          <input
            id="firstname"
            type="text"
            name="firstname"
            className="input-field"
            value={formData.firstname}
            onChange={handleChange}
          />
          {errors.firstname && (
            <p data-testid="error-message-firstname" className="error-message">
              {errors.firstname}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="lastname" className="label-text">
            Last name:
          </label>
          <input
            id="lastname"
            type="text"
            name="lastname"
            className="input-field"
            value={formData.lastname}
            onChange={handleChange}
          />
          {errors.lastname && (
            <p data-testid="error-message-lastname" className="error-message">
              {errors.lastname}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="username" className="label-text">
            Username:
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className="input-field"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && (
            <p data-testid="error-message-username" className="error-message">
              {errors.username}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email" className="label-text">
            Email:
          </label>
          <input
            id="email"
            type="text"
            name="email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p data-testid="error-message-email" className="error-message">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="details" className="label-text">
            Your motto in life :):
          </label>
          <input
            id="details"
            type="text"
            name="description"
            className="input-field"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="password" className="label-text">
            Password:
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p data-testid="error-message-password" className="error-message">
              {errors.password}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="passwordConfirmation" className="label-text">
            Confirm password:
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            name="passwordConfirmation"
            className="input-field"
            value={formData.passwordConfirmation}
            onChange={handleChange}
          />
          <p
            data-testid="error-message-passwordConfirmation"
            className="error-message"
          >
            {errors.passwordConfirmation}
          </p>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            name="acceptTerms"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
          />
          <label htmlFor="acceptTerms" className="checkbox-label">
            I accept the <a href="#">terms and conditions</a>
          </label>
        </div>

        <button type="button" className="submit-button" onClick={handleSignup}>
          SIGNUP
        </button>
      </form>
    </div>
  );
}

export default Signup;
