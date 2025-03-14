import React from 'react';
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import ToDoList from '../components/ToDoListComponents/ToDoList';
import StudyRoomComponent from '../components/StudyRoomComponent';
import Analytics from './Analytics';
import ProfileBox from './ProfileBox';
import CalendarPage from '../pages/Calendar';

function Dashboard() {
    const navigate = useNavigate();

    const gotoCalendar = () => {
        const user_id = localStorage.getItem('user_id');
        console.log(user_id);
        navigate(`/calendar/`, {
            state: { userId : user_id }
        });
        }

    return (
        <div className='dashboard-container'>
            <h1 className="dashboard-heading">Dashboard</h1> {/* A simple heading */}

            {/* This is where all the main components will go*/}
            {/* Left panel - main panel - right panel*/}
            <div className = "dashboard-content">
                <div className = "dashboard-left-panel" data-testid="left-panel">
                    <Analytics />
                    <div className="dashboard-panel">
                    <button onClick={gotoCalendar}>Go to Calendar</button>   
                    </div>
                    <div className="dashboard-panel">Invites</div>
                </div>
                <div className = "dashboard-main-panel" data-testid="main-panel">
                    <div className="dashboard-panel"><ProfileBox /></div>
                    <div className="dashboard-panel">Friends List</div>
                    <div className="dashboard-panel">Add Friends</div>
                </div>
                <div className = "dashboard-right-panel" data-testid="right-panel">
                    <StudyRoomComponent />
                    <div className="dashboard-panel"><ToDoList/></div>
                </div>

                </div>
            </div>
         );
}

export default Dashboard;
