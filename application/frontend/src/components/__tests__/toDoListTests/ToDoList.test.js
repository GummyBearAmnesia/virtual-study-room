import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ToDoList from '../../ToDoListComponents/ToDoList';
import * as authService from '../../../utils/authService'; 


jest.mock('../../../utils/authService', () => ({
    getAuthenticatedRequest: jest.fn(),
}));

const mockListsData = [
    {
        id: 1,
        name: "List 1",
        tasks: [
            { id: 1, title: "Task 1", content: "Task 1 details", is_completed: false },
            { id: 2, title: "Task 2", content: "Task 2 details", is_completed: true },
        ],
    },
    {
        id: 2,
        name: "List 2",
        tasks: [
            { id: 3, title: "Task 3", content: "Task 3 details", is_completed: false },
        ],
    },
];

describe("ToDoList", () => {

    beforeEach(() => {

        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(window, 'alert').mockImplementation(() => { });

    });

    afterEach(() => {

        console.error.mockRestore();
        window.alert.mockRestore();
    });

    const setup = () => {
        render(<ToDoList />);
    };

    test('renders the list of to-do lists correctly', async () => {
        authService.getAuthenticatedRequest.mockResolvedValue(mockListsData);

        setup();
        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByText('To-Do Lists')).toBeInTheDocument());
        expect(screen.getByText('List 1')).toBeInTheDocument();
    });

    test('should handle API error and show an alert when fetching tasks fails', async () => {

        authService.getAuthenticatedRequest.mockRejectedValue({
            response: { data: { error: "Failed to fetch tasks" } },
        });

        render(<ToDoList />);

        await waitFor(() => screen.queryByText(/Loading To-Do Lists.../i), { timeout: 3000 });
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(window.alert).toHaveBeenCalledWith("Failed to fetch tasks");
        expect(console.error).toHaveBeenCalled();
        expect(console.error.mock.calls[0][0]).toContain("Error fetching to-do lists");

    });

    test('handles error while fetching lists (without response)', async () => {
        // Mock API rejection with an error that does NOT have a response
        authService.getAuthenticatedRequest.mockRejectedValueOnce(new Error('Some network error'));

        render(<ToDoList />);

        expect(screen.getByText('Loading To-Do Lists...')).toBeInTheDocument();

        window.alert = jest.fn(); // Mock alert

        // Ensure alert is NOT called because error.response is missing
        await waitFor(() => expect(window.alert).not.toHaveBeenCalled());
    });


    test('renders task details correctly with and without content', async () => {
        const taskWithContent = {
            id: 1,
            title: 'Task with content',
            content: 'Some task content',
            is_completed: false,
        };

        const taskWithoutContent = {
            id: 2,
            title: 'Task without content',
            content: '',
            is_completed: false,
        };

        const mockListsData = [
            {
                id: 1,
                name: 'List 1',
                tasks: [taskWithContent, taskWithoutContent],
            },
        ];

        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);

        await screen.findByText('List 1');

        const taskDetailButtonWithContent = screen.getAllByRole('button', { name: /task details/i })[0];
        fireEvent.click(taskDetailButtonWithContent);

        expect(screen.getAllByText('Description:').length).toBeGreaterThan(0);
        expect(screen.getByText('Some task content')).toBeInTheDocument();
        
        const taskDetailButtonWithoutContent = screen.getAllByRole('button', { name: /task details/i })[1];
        fireEvent.click(taskDetailButtonWithoutContent);

        expect(screen.getByText('No details available')).toBeInTheDocument();
    });


    test('should toggle task completion status correctly', async () => {
        authService.getAuthenticatedRequest.mockResolvedValue(mockListsData);
        render(<ToDoList />);
        await waitFor(() => screen.queryByText(/Loading To-Do Lists.../i), { timeout: 3000 });
        const taskCheckbox = screen.getAllByRole('checkbox'); // Use `getAllByRole` for multiple checkboxes
        await act(async () => {
            fireEvent.click(taskCheckbox[0]); // This triggers the state update
        });
        
        expect(taskCheckbox[0].checked).toBe(true); // Adjust this according to the completion logic

        const taskLabel = screen.getByText(/Task 1/i);
        expect(taskLabel).toHaveClass('completed');

    });


    test("should log an error if task update request fails", async () => {

        // Step 1: Render successfully with mock data
        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);

        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        expect(screen.getByText("List 1")).toBeInTheDocument(); // Ensure list is displayed
        authService.getAuthenticatedRequest.mockRejectedValueOnce(new Error("API Error"));
        const taskCheckbox = screen.getAllByRole("checkbox")[0]; // Get first task checkbox

        await act(async () => {
            fireEvent.click(taskCheckbox); // Simulate toggling the task
        });

        expect(console.error).toHaveBeenCalledWith("Error fetching to-do lists:", expect.any(Error));

    });


    test("should log an error if API returns status 0", async () => {

        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);
        authService.getAuthenticatedRequest.mockResolvedValue({ status: 0 });

        await waitFor(() => screen.queryByText(/Loading To-Do Lists.../i));
        const taskCheckbox = screen.getAllByRole("checkbox")[0]; // Get first task checkbox
        await act(async () => {
            fireEvent.click(taskCheckbox); // Simulate toggling the task
        });

        expect(console.error).toHaveBeenCalledWith("Error updating task status");

    });


    const newTask = [
        {
            id: 1,
            name: "List 1",
            tasks: [
                { id: 1, title: "Task 2", content: "Task 2 details", is_completed: true },
            ],
        },
        {
            id: 2,
            name: "List 2",
            tasks: [
                { id: 3, title: "Task 3", content: "Task 3 details", is_completed: false },
            ],
        },
    ];

    test('delete task', async () => {
        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData); // Initial state

        render(<ToDoList />);

        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        expect(screen.getByText("List 1")).toBeInTheDocument(); // Ensure List 1 is displayed
        expect(screen.getByText("Task 1")).toBeInTheDocument(); // Ensure Task 1 is displayed
        authService.getAuthenticatedRequest.mockResolvedValueOnce(newTask); // Updated data after deletion

        const deleteTaskButton = screen.getAllByRole("button").find(button => {
            return button.classList.contains("btn-danger") && button.closest("li")?.querySelector("span")?.textContent === "Task 1";
        });

        expect(deleteTaskButton).toBeInTheDocument();
        fireEvent.click(deleteTaskButton);

        await waitFor(() => {
            expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
                "/delete_task/1/", // The URL should match this for the task deletion
                'DELETE'            // The HTTP method should be DELETE
            );
        });

        await waitFor(() => {
            expect(screen.queryByText("Task 1")).not.toBeInTheDocument(); // Ensure Task 1 is deleted
            expect(screen.queryByText("Task 2")).toBeInTheDocument(); // Ensure Task 2 remains
        });

        await waitFor(() => {
            const taskItems = screen.queryAllByRole("listitem"); // Get all list items (tasks)
            expect(taskItems).toHaveLength(2); // Only Task 2 should remain (Task 1 deleted)
        });
    });

    const newList = [
        {
            id: 1,
            name: "List 1",
            tasks: [
                { id: 1, title: "Task 1", content: "Task 1 details", is_completed: false },
                { id: 2, title: "Task 2", content: "Task 2 details", is_completed: true },
            ],
        },
    ];
    
    test("delete list", async () => {

        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData); // Initial state

        render(<ToDoList />);

        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        expect(screen.getByText("List 1")).toBeInTheDocument(); // Ensure list is displayed
        expect(screen.getByText("Task 1")).toBeInTheDocument(); // Ensure Task 1 is present

        authService.getAuthenticatedRequest.mockResolvedValueOnce(newList); // Updated data after deletion

        const deleteListButton = screen.getAllByRole("button", { hidden: true }).find(button => {
            return button.classList.contains("btn-danger") && button.querySelector("i.bi-trash"); // Identify the delete list button
        });

        expect(deleteListButton).toBeInTheDocument(); // Ensure delete list button is found
        fireEvent.click(deleteListButton);

        await waitFor(() => {
            expect(screen.queryByText("List 2")).not.toBeInTheDocument(); // Ensure Task 1 is deleted
        });
        await waitFor(() => {
            expect(screen.queryByText("Task 3")).not.toBeInTheDocument(); // Ensure Task 1 is deleted
        });

    });


    test("delete task error", async () => {

        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);

        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        expect(screen.getByText("List 1")).toBeInTheDocument(); // Ensure list is displayed
        
        authService.getAuthenticatedRequest.mockRejectedValueOnce(new Error("API Error"));
        const deleteTaskButton = screen.getAllByRole("button").find(button => {
            return button.classList.contains("btn-danger") && button.closest("li")?.querySelector("span")?.textContent === "Task 1";
        });

        expect(deleteTaskButton).toBeInTheDocument();
        console.error = jest.fn();
        fireEvent.click(deleteTaskButton);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith("Error fetching to-do lists:", expect.any(Error));
        });
    });

    test("delete list error", async () => {

        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);

        await waitFor(() => expect(authService.getAuthenticatedRequest).toHaveBeenCalled());
        expect(screen.getByText("List 1")).toBeInTheDocument(); // Ensure list is displayed

        authService.getAuthenticatedRequest.mockRejectedValueOnce(new Error("API Error"));
        const deleteListButton = screen.getAllByRole("button", { hidden: true }).find(button => {
            return button.classList.contains("btn-danger") && button.querySelector("i.bi-trash"); // Identify the delete list button
        });

        expect(deleteListButton).toBeInTheDocument(); // Ensure delete list button is found
        console.error = jest.fn();
        fireEvent.click(deleteListButton);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith("Error fetching to-do lists:", expect.any(Error));
        });
    });

    test('create new task', async () => {
        
        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);

        await screen.findByText('List 1'); 
        
        const addTaskButton = screen.getAllByRole('button', { name: /add task/i });

        fireEvent.click(addTaskButton[0]);

        const modal = await screen.findByRole('dialog'); 
        expect(modal).toBeInTheDocument();

        const titleInput = screen.getByPlaceholderText("Enter task title");
        const contentInput = screen.getByPlaceholderText("Enter task content");

        expect(titleInput).toBeInTheDocument();
        expect(contentInput).toBeInTheDocument();
    });

    test('create new list', async () => {

        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        render(<ToDoList />);

        await screen.findByText('List 1'); 

        const addTaskButton = screen.getByRole('button', { name: /add list/i });

        fireEvent.click(addTaskButton);

        const modal = await screen.findByRole('dialog');
        expect(modal).toBeInTheDocument();

        const titleInput = screen.getByPlaceholderText("Enter list title");
        expect(titleInput).toBeInTheDocument();
    });

    test("toggles full-screen mode", async () => {
        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        const { container } = render(<ToDoList />);
        await screen.findByText("Loading To-Do Lists...");
        await screen.findByText("List 1");

        const fullScreenButton = await screen.findByRole("button", {
            name: /view all/i,
        });

        fireEvent.click(fullScreenButton);
        const todoContainer = container.querySelector(".todo-container"); // Query by class name
        expect(todoContainer).toHaveClass("full-screen");

        const exitViewButton = await screen.findByRole("button", {
            name: /exit view/i,
        });

        fireEvent.click(exitViewButton);
        expect(todoContainer).not.toHaveClass("full-screen");
        const viewAllButton = await screen.findByRole("button", {
            name: /view all/i,
        });
    });

    test("toggles task details", async () => {
        authService.getAuthenticatedRequest.mockResolvedValueOnce(mockListsData);

        const { container } = render(<ToDoList />);
        await screen.findByText("Loading To-Do Lists...");
        await screen.findByText("List 1");

        const taskDetailButtons = screen.getAllByRole('button', { name: /task details/i });
        expect(taskDetailButtons).toHaveLength(3);
        fireEvent.click(taskDetailButtons[0]);

        const taskDetails = container.querySelector('.task-details');
        expect(taskDetails).toBeInTheDocument();  

        fireEvent.click(taskDetailButtons[0]);

        expect(taskDetails).not.toBeInTheDocument();
    });

});
