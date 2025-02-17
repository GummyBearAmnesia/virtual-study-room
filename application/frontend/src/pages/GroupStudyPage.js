import React from 'react';
import "../styles/GroupStudyPage.css";

function GroupStudyPage(){
    return (
        <div className='groupStudyRoom-container'>
            <div className="column">
                <div className="todo-list-container">TO DO List</div>
                <div className="sharedMaterials-container">Shared Materials</div>
            </div>
            <div className="column">
                <div className="user-list-container">
                    <h2 class="heading">Study Room:</h2>
                    <div class="user-row">
                       
                    </div>
                </div>
                <div className="motivationMessage-container">Motivation Message</div>
            </div>
            <div className="column">
                <div className="timer-container">Timer</div>
                <div className="custom-container">Customization Options</div>
                <div className="chatBox-container">Chat Box</div>
            </div>
        </div>
    );
}

export default GroupStudyPage;
