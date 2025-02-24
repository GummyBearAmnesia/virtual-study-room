import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Analytics.css";

const Analytics = () => {
    const { username } = useParams();
    const [analytics, setAnalytics] = useState({ streaks: 0, average_study_hours: 0 });

    useEffect(() => {
        const url = username
            ? `http://127.0.0.1:8000/api/analytics/${username}/`
            : `http://127.0.0.1:8000/api/analytics/`;

        axios.get(url, { withCredentials: true })
            .then(response => setAnalytics(response.data))
            .catch(error => console.error(
                "Error fetching analytics:", error.response ? error.response.status : error.message
            ));
    }, [username]);

    return (
        <div className="analytics-box">
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
                <div className="share-label">
                    <p>Share Analytics with Friends?</p>
                    <div className="tooltip-container">
                        <span className="info-icon">i</span>
                        <span className="tooltip">Allow friends to see your study progress</span>
                    </div>
                </div>
                <div className="button-container">
                    <button className="no-btn">No</button>
                    <button className="yes-btn">Yes</button>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
