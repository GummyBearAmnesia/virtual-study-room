import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import axios from "axios";
import { jwtDecode } from 'jwt-decode';


const ToDoList = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return;

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/token/refresh/", // This is the endpoint for refreshing tokens
                { refresh: refreshToken }
            );

            // Update tokens in localStorage
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            return response.data.access; // Return the new access token
        } catch (error) {
            console.error("Error refreshing token", error);
            return null;
        }
    };

    const isTokenExpired = (token) => {
        if (!token) return true;
        const decoded = jwtDecode(token); // Decode JWT token
        const currentTime = Date.now() / 1000; // Current time in seconds
        return decoded.exp < currentTime;
    };

    useEffect(() => {
        const fetchData = async () => {
            const isShared = "false";
            const token = localStorage.getItem('access_token');

            if (token && isTokenExpired(token)) {
                // Refresh token if expired
                const refreshedToken = await refreshToken();
                if (refreshedToken) {
                    // Retry the request with the new token
                    try {
                        const response = await axios.get(`http://127.0.0.1:8000/api/todolists/${isShared}/`, {
                            headers: { Authorization: `Bearer ${refreshedToken}` }
                        });
                        setLists(response.data);
                        setLoading(false);
                    } catch (error) {
                        console.error("Error fetching data:", error);
                        setLoading(false);
                    }
                }
            } else {
                // Use the original token
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/todolists/${isShared}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setLists(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, []); // The empty dependency array means this runs only once when the component mounts



    const toggleTaskCompletion = (listId, taskId, currentStatus) => {
        // Update task completion status
        /*axios
            .patch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                is_finished: !currentStatus,
            })
            .then(() => {
                // Update UI after successful API call
                setLists((prevLists) =>
                    prevLists.map((list) =>
                        list.id === listId
                            ? {
                                ...list,
                                tasks: list.tasks.map((task) =>
                                    task.id === taskId
                                        ? { ...task, is_finished: !currentStatus }
                                        : task
                                ),
                            }
                            : list
                    )
                );
            })
            .catch((error) => console.error("Error updating task:", error));*/
    };

    if (loading) return <div>Loading To-Do Lists...</div>;

    return (
        <div className="todo-container">
            <h3>To-Do Lists</h3>
            <div className="todo-list">
                {lists.map((list) => (
                    <div className="todo-card" key={list.id}>
                        <h4>{list.name}</h4>
                        <ul>
                            {list.tasks.map((task) => (
                                <li key={task.id} className="task-item">
                                    <input
                                        type="checkbox"
                                        checked={task.is_finished}
                                        onChange={() =>
                                            toggleTaskCompletion(list.id, task.id, task.is_finished)
                                        }
                                    />
                                    <span className={task.is_finished ? "completed" : ""}>
                                        {task.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default ToDoList;
