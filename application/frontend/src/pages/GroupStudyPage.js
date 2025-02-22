import React, { useState } from 'react';
import "../styles/GroupStudyPage.css";

function GroupStudyPage(){

    const [isActiveAddMore, setIsActiveAddMore] = useState(false); //initialise both variables: isActive and setIsActive to false
    const [isActiveMusic, setIsActiveMusic] = useState(false);
    const [isActiveCustom, setIsActiveCustom] = useState(false);

    const handleMouseDown = (btnType) => {
        //when the button is pressed then the variable setIsActive is set to True
        if (btnType == 'addMore') {
            setIsActiveAddMore(true);
        } else if (btnType == 'music') {
            setIsActiveMusic(true);
        } else if (btnType == 'custom'){
            setIsActiveCustom(true)
        }
        
    };

    const handleMouseUp = (btnType) => {
        //when the button is released then setIsActive is set to False
        if (btnType == 'addMore') {
            setIsActiveAddMore(false);
        } else if (btnType == 'music') {
            setIsActiveMusic(false);
        } else if (btnType == 'custom'){
            setIsActiveCustom(false)
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
        <div className='groupStudyRoom-container'>
            {/*1st Column */}
            <div className="column">
                <div className="todo-list-container">
                    <h2 className='todo-heading'>To Do: 
                    <div class="checkbox-wrapper-5">
                        <div class="check">
                            <input id="check-5" type="checkbox"></input>
                            <label for="check-5"></label>
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
                                    <label htmlFor={`todo-${todo.id}`}>{todo.text}</label>
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

                <div className="sharedMaterials-container">Shared Materials</div>
            </div>
            {/*2nd Column */}
            <div className="column">
                <div className="user-list-container">
                    <h2 className="heading"> Study Room: </h2>
                    <h3 className='heading2'> Code: </h3>
                    <div className='users'>
                        {/*These are examples of how the user profiles are displayed. 
                        user-image has the white circle, user-name is for the name at the bottom of the user. Can be changed, this is just an example.*/}
                        <div class="user-circle"> 
                            <div class="user-image">JD</div>
                            <div class="user-name">John Doe</div>
                        </div>
                        <div class="user-circle">
                            <div class="user-image">JD</div>
                            <div class="user-name">John Doe</div>
                        </div>
                        <div class="user-circle">
                            <div class="user-image">JD</div>
                            <div class="user-name">John Doe</div>
                        </div>
                        <div class="user-circle">
                            <div class="user-image">JD</div>
                            <div class="user-name">John Doe</div>
                        </div>
                        <div class="user-circle">
                            <div class="user-image">JD</div>
                            <div class="user-name">John Doe</div>
                        </div>
                        <div class="user-circle">
                            <div class="user-image">JD</div>
                            <div class="user-name">John Doe</div>
                        </div>
                    </div>
                </div>
                <div className="motivationMessage-container">Motivation Message</div>
            </div>
            {/*3rd Column */}
            <div className="column">
                <div className="timer-container">Timer</div>
                <div className="custom-container">
                    {/*This is the button for music and customisation, needs functionality */}
                    <button
                        type="button"
                        className={`music-button ${isActiveMusic ? 'active' : ''}`}
                        onMouseDown={() => handleMouseDown('music')}
                        onMouseUp={() => handleMouseUp('music')}
                        onMouseLeave={() => handleMouseUp('music')}
                        >Music
                    </button>
                    <button
                        type="button"
                        className={`customisation-button ${isActiveCustom ? 'active' : ''}`}
                        onMouseDown={() => handleMouseDown('custom')}
                        onMouseUp={() => handleMouseUp('custom')}
                        onMouseLeave={() => handleMouseUp('custom')}
                        >Customisation
                    </button>
                </div>
                <div className="chatBox-container">Chat Box</div>
            </div>
        </div>
    );
}

export default GroupStudyPage;