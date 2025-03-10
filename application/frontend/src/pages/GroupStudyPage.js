import React, { useState } from 'react';
import "../styles/GroupStudyPage.css";
import MotivationalMessage from './Motivation';
import musicLogo from "../assets/music_logo.png";
import customLogo from "../assets/customisation_logo.png";
import copyLogo from "../assets/copy_logo.png";
import exitLogo from "../assets/exit_logo.png";
import StudyTimer from '../components/StudyTimer.js';

function GroupStudyPage(){

    const [isActiveAddMore, setIsActiveAddMore] = useState(false); //initialise both variables: isActive and setIsActive to false
    const [isActiveMusic, setIsActiveMusic] = useState(false);
    const [isActiveCustom, setIsActiveCustom] = useState(false);
    const [isActiveCopy, setIsActiveCopy] = useState(false);
    const [isActiveExit, setIsActiveExit] = useState(false);

    const handleMouseDown = (btnType) => {
        //when the button is pressed then the variable setIsActive is set to True
        if (btnType === 'addMore') {
            setIsActiveAddMore(true);
        } else if (btnType === 'music') {
            setIsActiveMusic(true);
        } else if (btnType === 'custom'){
            setIsActiveCustom(true)
        } else if (btnType === 'copy'){
            setIsActiveCopy(true)
        } else if (btnType === 'exit'){
            setIsActiveExit(true)
        }
    };

    const handleMouseUp = (btnType) => {
        //when the button is released then setIsActive is set to False
        if (btnType === 'addMore') {
            setIsActiveAddMore(false);
        } else if (btnType === 'music') {
            setIsActiveMusic(false);
        } else if (btnType === 'custom'){
            setIsActiveCustom(false)
        } else if (btnType === 'copy'){
            setIsActiveCopy(false)
        } else if (btnType === 'exit'){
            setIsActiveExit(false)
        }
    };

    //testing functions- for UI purposes (not linked to the database)

    const [todos, setTodos] = useState([
        { id: 1, text: "Study for Math", checked: false },
        { id: 2, text: "Study for English", checked: false },
        { id: 3, text: "Study for Geography", checked: false },
        { id: 4, text: "Study for Chemistry", checked: false },
        { id: 5, text: "Study for Economics", checked: false },
        { id: 6, text: "Study for Engineering", checked: false },
        { id: 7, text: "Study for Physics", checked: false },
        { id: 8, text: "Study for Biology", checked: false },
    ]);

    const toggleTodo = id => {
        const newTodos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, checked: !todo.checked };
            }
            return todo;
        });
        setTodos(newTodos);
    };

    //page is designed in columns
    //First Column: todoList, shared materials 
    //Second Column: users listes, motivational message
    //Third Column: Timer, customisation, chatbox
    
    return (
        <div className='groupStudyRoom-container' data-testid="groupStudyRoom-container">
            {/*1st Column */}
            <div className="column" role='column' data-testid="column-1">
                <div className="todo-list-container" data-testid="todo-list-container">
                    <h2 className='todo-heading'>To Do: 
                    <div className="checkbox-wrapper-5">
                        <div className="check">
                            <input id="check-5" type="checkbox"></input>
                            <label htmlFor="check-5"></label>
                        </div>
                    </div>
                    </h2>
                    <div style={{ flex: 1, width: '100%' }}> {/* This div takes all available space */}
                    {todos.map(todo => (
                            <div key={todo.id} className="todo-item">
                                <div className="checkbox-wrapper-28">
                                    <input
                                        id={`todo-${todo.id}`}
                                        type="checkbox"
                                        className="checkbox"
                                        checked={todo.checked}
                                        onChange={() => toggleTodo(todo.id)}
                                    />
                                    <label htmlFor={`todo-${todo.id}`} className='todo-label'>{todo.text}</label>
                                </div>
                                <button type= "button" className='delete-button' >X</button>
                            </div>
                        ))}
                    </div>
                    {/*This is the add More button in the to do list- needs functionality (onClick method) */}
                    <button
                        type="button"
                        className={`add-more-button ${isActiveAddMore ? 'active' : ''}`}
                        onMouseDown={() => handleMouseDown('addMore')}
                        onMouseUp={() => handleMouseUp('addMore')}
                        onMouseLeave={() => handleMouseUp('addMore')}
                        >Add More
                    </button>      
                </div>

                <div className="sharedMaterials-container" data-testid="sharedMaterials-container">Shared Materials</div>
            </div>
            {/*2nd Column */}
            <div className="column" role='column' data-testid="column-2">
                <div className="user-list-container" data-testid="user-list-container">
                    <h2 className="heading"> Study Room: </h2>
                    <div className='utility-bar' data-testid="utility-bar">
                        <button
                            type="button"
                            className={`music-button ${isActiveMusic ? 'active' : ''}`}
                            onMouseDown={() => handleMouseDown('music')}
                            onMouseUp={() => handleMouseUp('music')}
                            onMouseLeave={() => handleMouseUp('music')}
                        >
                            <img src={musicLogo} alt="Music" />
                        </button>
                        <button
                            type="button"
                            className={`customisation-button ${isActiveCustom ? 'active' : ''}`}
                            onMouseDown={() => handleMouseDown('custom')}
                            onMouseUp={() => handleMouseUp('custom')}
                            onMouseLeave={() => handleMouseUp('custom')}
                        >
                            <img src={customLogo} alt="Customisation" />
                        </button>
                    </div>
                    <h3 className='gs-heading2'> Code: a2654h </h3>
                    <div className='utility-bar-2' data-testid="utility-bar-2">
                        <button
                            type="button"
                            className={`copy-button ${isActiveCopy ? 'active' : ''}`}
                            onMouseDown={() => handleMouseDown('copy')}
                            onMouseUp={() => handleMouseUp('copy')}
                            onMouseLeave={() => handleMouseUp('copy')}
                        >
                            <img src={copyLogo} alt="Copy" />
                            
                        </button>
                        <button
                            type="button"
                            className={`exit-button ${isActiveExit ? 'active' : ''}`}
                            onMouseDown={() => handleMouseDown('exit')}
                            onMouseUp={() => handleMouseUp('exit')}
                            onMouseLeave={() => handleMouseUp('exit')}
                        >
                            <img src={exitLogo} alt="Exit" />
                        </button>
                    </div>
                    <div className='users'>
                        {/*These are examples of how the user profiles are displayed. 
                        user-image has the white circle, user-name is for the name at the bottom of the user. Can be changed, this is just an example.*/}
                        <div className="user-circle"> 
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                        <div className="user-circle">
                            <div className="user-image">JD</div>
                            <div className="user-name">John Doe</div>
                        </div>
                    </div>
                </div>
                <MotivationalMessage data-testid="motivationalMessage-container"/>
            </div>
            {/*3rd Column */}
            <div className="column" role='column'  data-testid="column-3">
                <StudyTimer roomId="yourRoomId" isHost={true} onClose={() => console.log('Timer closed')} data-testid="studyTimer-container"/>
                <div className="chatBox-container"  data-testid="chatBox-container">Chat Box</div>
            </div>
        </div>
    );
}

export default GroupStudyPage;