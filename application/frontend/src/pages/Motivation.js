import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/MotivationalMessage.css";

const MotivationalMessage = () => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/motivational-message/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Error fetching message:", error);
        setMessage("Failed to load message");
      });
  }, []);

  return (
    <div className="message-container">
      <div className="message-card">
        <h4>{message}</h4>
      </div>
    </div>
  );
};

export default MotivationalMessage;
