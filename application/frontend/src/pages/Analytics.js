import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Analytics.css";
import { getAuthenticatedRequest } from "../utils/authService";

const Analytics = () => {
    const [analytics, setAnalytics] = useState({ streaks: 0, total_hours_studied: 0, average_study_hours: 0, is_sharable: false });

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
        console.log(analytics);
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    const toggleTaskCompletion = async () => {
        try {
            const response = await getAuthenticatedRequest(`/share_analytics/`, "PATCH");
            if (response.status === 0) {
                console.error("Error updating task status");
            } else {
                setAnalytics(prevList => ({
                    ...prevList, is_sharable: !prevList.is_sharable
                }));
            }
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        }
    };


    return ( 
        <div className="dashboard-panel analytics">
            <h2>Statistics</h2>
            <div className="stats">
                <div className="stat">
                    <div className="circle">
                        <span className="number">{analytics.streaks}</span>
                    </div>
                    <div className="stat-label">
                        <p>Day Streak</p>
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
                        <p>Average Hours</p>
                        <div className="tooltip-container">
                            <span className="info-icon">i</span>
                            <span className="tooltip">Your average time spent in a study room in hours</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="share">
                <div className="share-label" >
                    <div className="checkbox-wrapper-5">
                        <p>Share Statistics</p>
                        <div className="check">
                            <input id="check-5"
                                type="checkbox"
                                checked={analytics.is_sharable}
                                onChange={() => toggleTaskCompletion()}></input>
                            <label htmlFor="check-5"></label>
                        </div>
                    </div>
                </div>
                <div className="button-container">
                </div>
            </div>
        </div>
    );
};

export default Analytics;
