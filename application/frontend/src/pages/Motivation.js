import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/MotivationalMessage.css";

const MotivationalMessage = ({ "data-testid": dataTestId }) => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    axios
        .get("https://studyspot.pythonanywhere.com/api/motivational-message/")
//      .get("http://127.0.0.1:8000/api/motivational-message/")
      .then((response) => {
        console.log("API Response:", response.data);
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Error fetching message:", error);
        setMessage("Failed to load message");
      });
  }, []);

  return (

      <div className="message-card" data-testid={dataTestId}>
        <h4>{message}</h4>
      </div>
    
  );
};

export default MotivationalMessage;
