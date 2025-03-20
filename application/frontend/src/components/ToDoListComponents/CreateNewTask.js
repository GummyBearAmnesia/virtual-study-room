import React, { useState } from "react";
import "../../styles/toDoList/CreateNewTask.css";

import { getAuthenticatedRequest } from "../../utils/authService";

const AddTaskModal = ({ addTaskWindow, setAddTaskWindow, listId, setLists, isShared }) => {
    const [formData, setFormData] = useState({ listId: listId, taskTitle: "", taskContent: "", isCompleted: false });

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSaveTask(formData, listId);
        setFormData({ taskTitle: "", taskContent: "" });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };


    const handleSaveTask = async (newTask, listId) => {
        console.log("Saving task to list", listId, "Task:", newTask.taskTitle, "Content:", newTask.taskContent);

        try {
            const response = await getAuthenticatedRequest("/new_task/", "POST", {
                list_id: listId,
                title: newTask.taskTitle,
                content: newTask.taskContent
            });

            console.log("Task being added to list:", response);
            
            
            if (!isShared) {
                setLists(prevLists =>
                    prevLists.map(list =>
                        list.id === listId
                            ? { ...list, tasks: [...list.tasks, response] }
                            : list
                    )
                );
            }
            setAddTaskWindow(false);
            console.log("Task Created:", response);

        } catch (error) {
            if (error.response) {
                alert(error.response.data.error);
            } else {
                alert("An error occurred. Please try again.");
            }
        }
    };



    const handleCancel = () => {
        setFormData({ taskTitle: "", taskContent: "" });
        setAddTaskWindow(false);
    };

    if (!addTaskWindow) return null;
    
    return (
        <div role="dialog" className="modal-overlay">
            <div className="modal-content">
                <h4>Add Task</h4>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="taskTitle"
                        value={formData.taskTitle}
                        onChange={handleChange}
                        placeholder="Enter task title"
                        required
                    />
                    <textarea
                        name="taskContent" 
                        value={formData.taskContent}
                        onChange={handleChange}
                        placeholder="Enter task content"
                        required
                        rows="4"
                    ></textarea>
                    <div>
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
