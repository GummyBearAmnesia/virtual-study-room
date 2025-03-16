import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Analytics.css";

const Analytics = () => {
    const [analytics, setAnalytics] = useState({ streaks: 0, average_study_hours: 0 });

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem("access_token"); // Get the access token from localStorage

            if (!token) {
                console.error("No access token found. Please log in.");
                return;
            }

            try {
                const response = await axios.get(
                    //"https://studyspot.pythonanywhere.com/api/analytics/",
                    "http://127.0.0.1:8000/api/analytics/", // Endpoint for fetching analytics
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the access token in the request
                        },
                        withCredentials: true,
                    }
                );
                setAnalytics(response.data); // Set the analytics data
            } catch (error) {
                console.error(
                    "Error fetching analytics:",
                    error.response ? error.response.status : error.message
                );
            }
        };

        fetchAnalytics();
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <div className="dashboard-panel analytics">
            <h2>Your Progress</h2>
            <div className="stats">
                <div className="stat">
                    <div className="circle">
                        <span className="number">{analytics.streaks}</span>
                    </div>
                    <div className="stat-label">
                        <p>Streak Days</p>
                        <div className="tooltip-container">
                            <span className="info-icon">i</span>
                            <span className="tooltip">Number of consecutive days you've studied</span>
                        </div>
                    </div>
                </div>
                <div className="stat">
                    <div className="circle">
                        <span className="number">{analytics.average_study_hours}</span>
                    </div>
                    <div className="stat-label">
                        <p>Avg Study Hours</p>
                        <div className="tooltip-container">
                            <span className="info-icon">i</span>
                            <span className="tooltip">Your average time spent in a study room in hours</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="share">
                <div className="share-label" ></div>
                <div className="button-container">
                </div>
            </div>
        </div>
    );
};

export default Analytics;
