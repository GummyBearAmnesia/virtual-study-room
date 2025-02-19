import React, { useState } from 'react';
import "../styles/GroupStudyPage.css";

function GroupStudyPage(){

    const [isActive, setIsActive] = useState(false); //initialise both variables: isActive and setIsActive to false

    const handleMouseDown = () => {
        setIsActive(true);  //when the button is pressed then the variable setIsActive is set to True
    };

    const handleMouseUp = () => {
        setIsActive(false); //when the button is released then setIsActive is set to False
    };

    const [todos, setTodos] = useState([
        { list_id: 1, text: "Study for Math", checked: false },
        { list_id: 2, text: "Study for English", checked: false },
        { list_id: 3, text: "Study for English", checked: false },
        { list_id: 4, text: "Study for English", checked: false },
        { list_id: 5, text: "Study for English", checked: false },
        { list_id: 6, text: "Study for English", checked: false },
        { list_id: 7, text: "Study for English", checked: false },
        { list_id: 8, text: "Study for English", checked: false },
    ]);

    const toggleTodo = list_id => {
        const newTodos = todos.map(todo => {
            if (todo.list_id === list_id) {
                return { ...todo, checked: !todo.checked };
            }
            return todo;
        });
        setTodos(newTodos);
    };
    return (
        <div className='groupStudyRoom-container'>
            <div className="column">
                <div className="todo-list-container">
                    <h2 className='todo-heading'>To Do: </h2>
                    <div style={{ flex: 1, width: '100%' }}> {/* This div takes all available space */}
                    {todos.map(todo => (
                            <div key={todo.list_id} className="todo-item">
                                <div className="checkbox-wrapper-28">
                                    <input
                                        id={`todo-${todo.list_id}`}
                                        type="checkbox"
                                        className="checkbox"
                                        checked={todo.checked}
                                        onChange={() => toggleTodo(todo.list_id)}
                                    />
                                    <label htmlFor={`todo-${todo.list_id}`}>{todo.text}</label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className={`add-more-button ${isActive ? 'active' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}  // Ensures the button resets its state
                        onMouseLeave={handleMouseUp}  // Resets state if mouse leaves the button while pressed
                    >Add More</button>         
                </div>

                <div className="sharedMaterials-container">Shared Materials</div>
            </div>
            <div className="column">
                <div className="user-list-container">
                    <h2 className="heading"> Study Room: </h2>
                    <h3 className='heading2'> Code: </h3>
                    <div className='users'>
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
            <div className="column">
                <div className="timer-container">
                    <div style={{ flex: 1, width: '100%' }}>{/* This div takes all available space */}
                    </div>
                    <button
                        type="button"
                        className={`timer-start-button ${isActive ? 'active' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}  // Ensures the button resets its state
                        onMouseLeave={handleMouseUp}  // Resets state if mouse leaves the button while pressed
                    >Start</button> 
                </div>
                <div className="custom-container">Customization Options</div>
                <div className="chatBox-container">Chat Box</div>
            </div>
        </div>
    );
}

export default GroupStudyPage;
