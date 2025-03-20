import React from 'react';
import "../styles/Dashboard.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import ToDoList from '../pages/ToDoList';
import ToDoList from '../components/ToDoListComponents/ToDoList';
import StudyRoomComponent from '../components/StudyRoomComponent';
import Analytics from './Analytics';
import  FriendsTab  from '../components/friends/FriendsTab';

import ProfileBox from './ProfileBox';

function Dashboard() { 
    const navigate = useNavigate();


    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div className = "dashboard-content">
                <div className = "dashboard-left-panel" data-testid="left-panel">
                    <div className="dashboard-panel"><ProfileBox /></div>
                    <Analytics />
                </div>
                <div className = "dashboard-main-panel" data-testid="main-panel">
                    <StudyRoomComponent />
                    <div className="dashboard-panel"><FriendsTab /></div>
                </div>
                <div className = "dashboard-right-panel" data-testid="right-panel">
                    <div><ToDoList
                        isShared={false}
                        listData={[]}
                    />
                    </div>

                </div>

                </div>
            </div>
         );
}

export default Dashboard;
