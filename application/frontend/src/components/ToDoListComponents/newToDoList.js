import React, { useState } from 'react';
import { getAuthenticatedRequest } from "../../utils/authService";
import "../../styles/toDoList/ToDoList.css";
import AddTaskModal from "./CreateNewTask";
import AddListModal from "./CreateNewList";
import useWebSocket from './useWebSocket';
import useToDoList from './useToDoList';
import TaskItem from './TaskItem';

const ToDoList = ({ isShared, listId = undefined, socket, roomCode = undefined }) => {
    const { lists, loading, setLists } = useToDoList(isShared, listId);
    const [addTaskWindow, setAddTaskWindow] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);
    const [addListWindow, setAddListWindow] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({});

    // WebSocket Hook
    useWebSocket(isShared, socket, listId, setLists, roomCode);

    const toggleTaskCompletion = async (taskId) => {
        try {
            const task = await getAuthenticatedRequest(`/update_task/${taskId}/`, "PATCH");

            if (isShared && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "toggle_task",
                    task_id: taskId,
                    is_completed: !task.is_completed,
                });
                socket.send(message);
            }
            if (!isShared) {
                setLists(prevLists =>
                    prevLists.map(list => ({
                        ...list,
                        tasks: list.tasks.map(task =>
                            task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
                        )
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const data = await getAuthenticatedRequest(`/delete_task/${taskId}/`, "DELETE");
            console.log(data.data)

            if (isShared && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "remove_task",
                    task_id: taskId,
                });
                socket.send(message);
            } else {
                setLists(prevLists =>
                    prevLists.map(list => ({
                        ...list,
                        tasks: list.tasks.filter(task => task.id !== taskId) // Remove the deleted task from tasks array
                    })))
            }

        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        }
    };



    const handleDeleteList = async (listId) => {
        try {
            const data = await getAuthenticatedRequest(`/delete_list/${listId}/`, "DELETE");
            setLists(data);
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } 
    };

    const handleAddTask = (listId) => {
        setSelectedListId(listId);
        setAddTaskWindow(true);

        if (isShared && socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: "add_task", list_id: listId });
            socket.send(message);
        }
    };

    const handleAddList = () => {
        setAddListWindow(true);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const toggleTaskDetails = (taskId) => {
        setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className={isFullScreen ? "todo-container full-screen" : "todo-container"}>
            {/* Header */}
            <div className="todo-header">
                {!isShared ? (
                    <>
                        <h3>To-Do Lists</h3>
                        <div className="header-buttons">
                            <button onClick={handleAddList} className="btn btn-success btn-sm" aria-label="Add List">
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            <button onClick={toggleFullScreen} className="full-screen-btn">
                                {isFullScreen ? (
                                    <>
                                        <i className="bi bi-box-arrow-in-down"></i> Exit View
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-arrows-fullscreen">View All</i>
                                    </>
                                )}
                            </button>
                        </div>
                    </>) : (<></>)
                }
            </div>
            {/* Task list rendering */}
            <div className="todo-list">
            {lists.map((list) => (
                <div className="todo-card" key={list.id}>
                    <div className="todo-card-header">
                        <button onClick={() => handleAddTask(list.id)} className="btn btn-success btn-sm" aria-label='add task'>
                            <i className="bi bi-plus-circle"></i>
                        </button>
                        {!isShared ? (
                            <button onClick={() => handleDeleteList(list.id)} className="btn btn-danger btn-sm" aria-label='delete list'>
                                <i className="bi bi-trash"></i>
                            </button>
                        ) : (<></>)
                        }
                    </div>

                    <h4>{list.name}</h4>
                    <ul>
                        {list.tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                //key={task.id + (task.is_completed ? "_checked" : "_unchecked")}
                                task={task}
                                toggleTaskCompletion={toggleTaskCompletion}
                                handleDeleteTask={handleDeleteTask}
                                toggleTaskDetails={toggleTaskDetails}
                                expandedTasks={expandedTasks}
                            />
                        ))}
                    </ul>
                </div>
            ))}
            </div>

            {/* Add Task Modal */}
            <AddTaskModal
                addTaskWindow={addTaskWindow}
                setAddTaskWindow={setAddTaskWindow}
                listId={selectedListId}
                setLists={setLists}
                isShared={isShared}
            />

            {/* Add List Modal */}
            {!isShared && (
                <AddListModal addListWindow={addListWindow} setAddListWindow={setAddListWindow} setLists={setLists} />
            )}
        </div>
    );
};

export default ToDoList;
