import React, { useState, useEffect } from "react";
import { getAuthenticatedRequest } from "../../utils/authService";
import "../../styles/ToDoList.css";
import AddTaskModal from "./CreateNewTask";
import AddListModal from "./CreateNewList";

const ToDoList = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [addTaskWindow, setAddTaskWindow] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);
    const [addListWindow, setAddListWindow] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({}); // Tracks expanded tasks

    useEffect(() => {
        console.log("Fetching data in useEffect...");
        const fetchData = async () => {

            try {
                const data = await getAuthenticatedRequest("/todolists/false/");

                console.log("Fetched data:", data);
                setLists(data);
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.error);
                }
                console.error("Error fetching to-do lists:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleTaskCompletion = async (taskId) => {
        try {
            const response = await getAuthenticatedRequest(`/update_task/${taskId}/`, "PATCH");
            if (response.status === 0) {
                console.error("Error updating task status");
            } else {
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
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const data = await getAuthenticatedRequest(`/delete_task/${taskId}/`, "DELETE");
            setLists(data);
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            const data = await getAuthenticatedRequest(`/delete_list/${listId}/`, "DELETE");
            setLists(data);
        } catch (error) {
            console.error("Error fetching to-do lists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (listId) => {
        setSelectedListId(listId);
        setAddTaskWindow(true);
    };

    const handleAddList = () => {
        setAddListWindow(true);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const toggleTaskDetails = (taskId) => {
        setExpandedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId], // Toggle state for the specific task
        }));
    };

    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className={isFullScreen ? "todo-container full-screen" : "todo-container"}>
            <div className="todo-header">
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
                                <i className="bi bi-arrows-fullscreen"></i> View All
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="todo-list">
                {lists.map((list) => (
                    <div className="todo-card" key={list.id}>
                        <div className="todo-card-header">
                            <button onClick={() => handleAddTask(list.id)} className="btn btn-success btn-sm" aria-label="Add Task">
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            <button onClick={() => handleDeleteList(list.id)} className="btn btn-danger btn-sm">
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>

                        <h4>{list.name}</h4>
                        <ul>
                            {list.tasks.map((task) => (
                                <li key={task.id} className="task">
                                    <div className="task-item">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={task.is_completed}
                                            onChange={() => toggleTaskCompletion(task.id)}
                                        />
                                        <span className={task.is_completed ? "completed" : ""}>
                                            {task.title}
                                        </span>

                                        <div className="task-item-buttons">

                                            {/* Delete Task Button */}
                                            <button onClick={() => handleDeleteTask(task.id)} className="btn btn-danger btn-sm">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                            {/* Expand/Collapse Button for Task Details */}
                                            <button onClick={() => toggleTaskDetails(task.id)} className="btn btn-info btn-sm" aria-label="Task Details">
                                                {expandedTasks[task.id] ? (
                                                    <>
                                                        <i className="bi bi-chevron-up"></i> Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-chevron-down"></i> Show Details
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Task Details (Only visible when expanded) */}
                                    {expandedTasks[task.id] && (
                                        <div className="task-details">
                                            <p><strong>Description:</strong> {task.content || "No details available"}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <AddTaskModal
                addTaskWindow={addTaskWindow}
                setAddTaskWindow={setAddTaskWindow}
                listId={selectedListId}
                setLists={setLists}
            />
            <AddListModal
                addListWindow={addListWindow}
                setAddListWindow={setAddListWindow}
                setLists={setLists}
            />
        </div>
    );
};

export default ToDoList;