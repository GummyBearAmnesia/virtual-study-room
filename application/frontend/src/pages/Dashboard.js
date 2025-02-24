
import React from "react";
import ToDoList from '../pages/ToDoList';
import "../styles/Dashboard.css";


function Dashboard() {
    return (
        <div >
            {/* Header */}
            <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>

            {/* Dashboard Layout */}
            <div className="grid-container">
                {/* Left Column */}
                <div className="grid-item  left-column">
                    <ToDoList />
                </div>

                {/* Middle Column */}
                <div className="grid-item">
                    
                </div>
                {/* Middle Column */}
                <div className="grid-item">
                    
                </div>
                {/* Middle Column */}
                <div className="grid-item">
                    
                </div>
                {/* Middle Column */}
                <div className="grid-item">
                    
                </div>

                {/* Right Column */}
                <div className="grid-item">
                    
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
