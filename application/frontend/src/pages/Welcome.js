import React from 'react';
import "../styles/Welcome.css";
import { useNavigate } from "react-router-dom";
import mangoCat from "../assets/mango_cat.png";

function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <h1 className="welcome-heading">The Study Spot</h1>
            <img src={mangoCat} alt="logo" className="welcome-image" />
            <div className="button-container">
                <button className="login-button" onClick={() => navigate("/login")}>
                    LOGIN
                </button>
                <button className="create-account-button" onClick={() => navigate("/signup")}>
                    CREATE ACCOUNT 
                </button>
            </div>
        </div>
    );

}

export default Welcome;