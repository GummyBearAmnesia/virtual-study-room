import React, { useState } from 'react';
import "../styles/Dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ToDoList from '../pages/ToDoList';
import Analytics from './Analytics';

function Dashboard() {
    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div class = "dashboard-content">
                <div class = "dashboard-left-panel">
                    <Analytics />
                    <div class="dashboard-panel">Calendar</div>
                    <div class="dashboard-panel">Invites</div>
                </div>
                <div class = "dashboard-main-panel">
                    <div class="dashboard-panel">Profile</div>
                    <div class="dashboard-panel">Friends List</div>
                    <div class="dashboard-panel">Add Friends</div>
                </div>
                <div class = "dashboard-right-panel">
                    <div class="dashboard-panel">Generate Group Study Room</div>
                    <div class="dashboard-panel">To Do List</div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
