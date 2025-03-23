import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import ToDoList from '../../ToDoListComponents/newToDoList';
import useToDoList from "../../ToDoListComponents/useToDoList";
import userEvent from '@testing-library/user-event';
import * as authService from "../../../utils/authService";
//import { renderHook } from '@testing-library/react-hooks';
jest.mock('../../ToDoListComponents/useToDoList', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../../../utils/authService", () => ({
    getAuthenticatedRequest: jest.fn(),
}));

authService.getAuthenticatedRequest.mockImplementation((url, method) => {
    if (method === "PATCH") {
        return Promise.resolve({ is_completed: true });
    }
    return Promise.resolve();
});

describe('ToDoList Component', () => {
    let setListsMock;

    beforeEach(() => {
        setListsMock = jest.fn();
        jest.spyOn(console, 'log').mockImplementation(() => { });

        useToDoList.mockImplementation(() => ({
            lists: [
                { id: 1, name: 'List 1', tasks: [{ id: 1, title: 'Task 1', is_completed: false }] },
            ],
            loading: false,
            setLists: setListsMock,
        }));
    });

    test('renders the component with lists and tasks', async () => {
        render(<ToDoList isShared={false} />);

        expect(screen.getByText('To-Do Lists')).toBeInTheDocument();
        expect(screen.getByText('List 1')).toBeInTheDocument();
        expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    test('displays loading message when loading', () => {
        useToDoList.mockImplementation(() => ({
            lists: [],
            loading: true,
            setLists: jest.fn(),
        }));

        render(<ToDoList isShared={false} />);

        expect(screen.getByText('Loading To-Do Lists...')).toBeInTheDocument();
    });

    test('toggles task completion when clicked', async () => {
        const { rerender } = render(<ToDoList isShared={false} />);

        const taskCheckbox = screen.getByLabelText("Complete Task 1");
        expect(taskCheckbox).not.toBeChecked(); 

        await act(async () => {
            await userEvent.click(taskCheckbox); 
        });
        expect(setListsMock).toHaveBeenCalled();

        const updateFunction = setListsMock.mock.calls[0][0];
        const updatedLists = updateFunction([
            { id: 1, name: 'List 1', tasks: [{ id: 1, title: 'Task 1', is_completed: false }] },
        ]);
        expect(updatedLists).toEqual([
            { id: 1, name: 'List 1', tasks: [{ id: 1, title: 'Task 1', is_completed: true }] },
        ]);

        useToDoList.mockImplementation(() => ({
            lists: updatedLists,
            loading: false,
            setLists: setListsMock,
        }));
        rerender(<ToDoList isShared={false} />);
        await waitFor(() => {
            expect(screen.getByLabelText("Complete Task 1")).toBeChecked(); 
        });
    });

    test('deletes a task when delete button is clicked', async () => {
        
        authService.getAuthenticatedRequest.mockImplementation((url, method) => {
            if (method === "DELETE") {
                return Promise.resolve({ data: {} }); 
            }
            return Promise.resolve();
        });

        const { rerender } = render(<ToDoList isShared={false} />);

        const deleteButton = screen.getByRole('button', { name: /delete task/i }); 
        await act(async () => {
            await userEvent.click(deleteButton);
        });

        expect(setListsMock).toHaveBeenCalled();

        const updateFunction = setListsMock.mock.calls[0][0];
        const updatedLists = updateFunction([
            { id: 1, name: 'List 1', tasks: [{ id: 1, title: 'Task 1', is_completed: false }] },
        ]);
        expect(updatedLists).toEqual([
            { id: 1, name: 'List 1', tasks: [] }, 
        ]);

        useToDoList.mockImplementation(() => ({
            lists: updatedLists,
            loading: false,
            setLists: setListsMock,
        }));
        rerender(<ToDoList isShared={false} />);
        await waitFor(() => {
            expect(screen.queryByText('Task 1')).not.toBeInTheDocument(); 
        });
    });

    it('opens the add task modal when add task button is clicked', async () => {
        render(<ToDoList isShared={false} />);

        const addTaskButton = screen.getByRole('button', { name: /add task/i });
        await userEvent.click(addTaskButton);
        expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    it('sends WebSocket message when task is toggled in shared mode', async () => {

        const mockSocket = {
            readyState: WebSocket.OPEN, 
            send: jest.fn((message) => {
                console.log('WebSocket message sent:', message);
            }),
        };

        authService.getAuthenticatedRequest.mockResolvedValue({
            id: 1,
            name: "Task 1",
            is_completed: false, 
        });

        render(<ToDoList isShared={true} socket={mockSocket} />);

        const taskCheckbox = screen.getByRole('checkbox', { name: /Complete Task 1/i });

        expect(taskCheckbox).not.toBeChecked();

        await userEvent.click(taskCheckbox);

        await waitFor(() => {
            console.log('Waiting for WebSocket message...');
            expect(mockSocket.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'toggle_task',
                    task_id: 1,
                    is_completed: true, 
                })
            );
        });
    });

    test('opens the add list modal when add list button is clicked', async () => {
        render(<ToDoList isShared={false} />);

        const addListButton = screen.getByRole('button', { name: /add list/i });
        await userEvent.click(addListButton);

        expect(screen.getByText('Add List')).toBeInTheDocument();
    });

    test('toggles full screen mode when full screen button is clicked', async () => {
        render(<ToDoList isShared={false} />);

        const fullScreenButton = screen.getByRole('button', { name: /view all/i });
        await userEvent.click(fullScreenButton);

        const todoContainer = document.querySelector('.todo-container');
        expect(todoContainer).toHaveClass('full-screen');

        await userEvent.click(fullScreenButton);
        expect(todoContainer).not.toHaveClass('full-screen');
    });

    test('toggles task details when task is clicked', async () => {
        render(<ToDoList isShared={false} />);

        const taskDetailsButton = screen.getByRole('button', { name: /task details/i });
        await userEvent.click(taskDetailsButton);
        expect(taskDetailsButton).toHaveTextContent('Hide Details');
        expect(taskDetailsButton).toContainHTML('<i class="bi bi-chevron-up"></i>');
        
        const taskDetails = screen.getByText(/Description:/i);
        expect(taskDetails).toBeInTheDocument();
        await userEvent.click(taskDetailsButton);
        expect(taskDetailsButton).toHaveTextContent('');
        expect(taskDetailsButton).toContainHTML('<i class="bi bi-chevron-down"></i>');
        expect(screen.queryByText(/Description:/i)).not.toBeInTheDocument();
    });

    test('deletes a list when delete list button is clicked', async () => {
        authService.getAuthenticatedRequest.mockImplementation((url, method) => {
            if (method === "DELETE" && url.includes("/delete_list/")) {
                return Promise.resolve([]);
            }
            return Promise.resolve();
        });

        const { rerender } = render(<ToDoList isShared={false} />);

        const deleteListButton = screen.getByRole('button', { name: /delete list/i });
        await act(async () => {
            await userEvent.click(deleteListButton);
        });

        expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
            "/delete_list/1/",
            "DELETE"
        );

        expect(setListsMock).toHaveBeenCalledWith([]);

        useToDoList.mockImplementation(() => ({
            lists: [],
            loading: false,
            setLists: setListsMock,
        }));

        rerender(<ToDoList isShared={false} />);

        await waitFor(() => {
            expect(screen.queryByText('List 1')).not.toBeInTheDocument();
        });
    });

    test('logs an error when deleting a list fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        authService.getAuthenticatedRequest.mockImplementation((url, method) => {
            if (method === "DELETE" && url.includes("/delete_list/")) {
                return Promise.reject(new Error("Failed to delete list"));
            }
            return Promise.resolve();
        });
        render(<ToDoList isShared={false} />);

        const deleteListButton = screen.getByRole('button', { name: /delete list/i });
        await act(async () => {
            await userEvent.click(deleteListButton);
        });

        expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
            "/delete_list/1/",
            "DELETE"
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error fetching to-do lists:",
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });

    test('sends WebSocket message when task is deleted in shared mode', async () => {
        
        const mockSocket = {
            readyState: WebSocket.OPEN, 
            send: jest.fn((message) => {
                console.log('WebSocket message sent:', message); 
            }),
        };

        authService.getAuthenticatedRequest.mockResolvedValue({
            data: {}, 
        });

        render(<ToDoList isShared={true} socket={mockSocket} />);

        const deleteButton = screen.getByRole('button', { name: /delete task/i });
        await act(async () => {
            await userEvent.click(deleteButton);
        });

        await waitFor(() => {
            console.log('Waiting for WebSocket message...');
            expect(mockSocket.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'remove_task',
                    task_id: 1,
                })
            );
        });
    });

    test('logs an error when deleting a task fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        authService.getAuthenticatedRequest.mockImplementation((url, method) => {
            if (method === "DELETE" && url.includes("/delete_task/")) {
                return Promise.reject(new Error("Failed to delete task"));
            }
            return Promise.resolve();
        });

        render(<ToDoList isShared={false} />);

        const deleteButton = screen.getByRole('button', { name: /delete task/i });
        await act(async () => {
            await userEvent.click(deleteButton);
        });

        expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
            "/delete_task/1/",
            "DELETE"
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error fetching to-do lists:",
            expect.any(Error) 
        );
        consoleErrorSpy.mockRestore();
    });

    test('does not send WebSocket message when socket is not open', async () => {
        
        const mockSocket = {
            readyState: WebSocket.CLOSED,
            send: jest.fn(),
        };

        authService.getAuthenticatedRequest.mockResolvedValue({
            data: {},
        });

        render(<ToDoList isShared={true} socket={mockSocket} />);

        const deleteButton = screen.getByRole('button', { name: /delete task/i });
        await act(async () => {
            await userEvent.click(deleteButton);
        });

        expect(mockSocket.send).not.toHaveBeenCalled();
    });

    test('WebSocket message is correctly formatted when deleting a task', async () => {
        const mockSocket = {
            readyState: WebSocket.OPEN, 
            send: jest.fn(),
        };

        authService.getAuthenticatedRequest.mockResolvedValue({
            data: {}, 
        });

        render(<ToDoList isShared={true} socket={mockSocket} />);

        const deleteButton = screen.getByRole('button', { name: /delete task/i });
        await act(async () => {
            await userEvent.click(deleteButton);
        });

        expect(mockSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: 'remove_task',
                task_id: 1,
            })
        );
    });

    test('logs an error when toggling task completion fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        authService.getAuthenticatedRequest.mockImplementation((url, method) => {
            if (method === "PATCH" && url.includes("/update_task/")) {
                return Promise.reject(new Error("Failed to toggle task completion"));
            }
            return Promise.resolve();
        });

        render(<ToDoList isShared={false} />);

        const taskCheckbox = screen.getByRole('checkbox', { name: /Complete Task 1/i });
        await act(async () => {
            await userEvent.click(taskCheckbox);
        });

        expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
            "/update_task/1/",
            "PATCH"
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error fetching to-do lists:",
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });

    test('toggles task completion correctly in non-shared mode', async () => {
        authService.getAuthenticatedRequest.mockResolvedValue({
            id: 1,
            title: "Task 1",
            is_completed: true, 
        });

        const { rerender } = render(<ToDoList isShared={false} />);

        const taskCheckbox = screen.getByRole('checkbox', { name: /Complete Task 1/i });
        await act(async () => {
            await userEvent.click(taskCheckbox);
        });

        expect(setListsMock).toHaveBeenCalled();

        const updateFunction = setListsMock.mock.calls[0][0];
        const updatedLists = updateFunction([
            { id: 1, name: 'List 1', tasks: [{ id: 1, title: 'Task 1', is_completed: false }] },
        ]);

        expect(updatedLists).toEqual([
            { id: 1, name: 'List 1', tasks: [{ id: 1, title: 'Task 1', is_completed: true }] },
        ]);
        useToDoList.mockImplementation(() => ({
            lists: updatedLists,
            loading: false,
            setLists: setListsMock,
        }));

        rerender(<ToDoList isShared={false} />);

        await waitFor(() => {
            expect(screen.getByRole('checkbox', { name: /Complete Task 1/i })).toBeChecked();
        });
    });

    test('does not send WebSocket message when socket is not open in shared mode', async () => {
        const mockSocket = {
            readyState: WebSocket.CLOSED, 
            send: jest.fn(),
        };

        authService.getAuthenticatedRequest.mockResolvedValue({
            id: 1,
            title: "Task 1",
            is_completed: true,
        });

        render(<ToDoList isShared={true} socket={mockSocket} />);

        const taskCheckbox = screen.getByRole('checkbox', { name: /Complete Task 1/i });
        await act(async () => {
            await userEvent.click(taskCheckbox);
        });

        expect(mockSocket.send).not.toHaveBeenCalled();
    });

    test('sends WebSocket message when adding a task in shared mode', async () => {
        
        const mockSocket = {
            readyState: WebSocket.OPEN, 
            send: jest.fn((message) => {
                console.log('WebSocket message sent:', message); 
            }),
        };

        render(<ToDoList isShared={true} socket={mockSocket} />);

        const addTaskButton = screen.getByRole('button', { name: /add task/i });
        await act(async () => {
            await userEvent.click(addTaskButton);
        });

        await waitFor(() => {
            expect(mockSocket.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'add_task',
                    list_id: 1, 
                })
            );
        });
    });

    test('does not toggle task completion for non-matching task ID', async () => {
        authService.getAuthenticatedRequest.mockResolvedValue({
            id: 1,
            title: "Task 1",
            is_completed: true, 
        });

        const { rerender } = render(<ToDoList isShared={false} />);
        const taskCheckbox = screen.getByRole('checkbox', { name: /Complete Task 1/i });
        await act(async () => {
            await userEvent.click(taskCheckbox);
        });

        expect(setListsMock).toHaveBeenCalled();

        const updateFunction = setListsMock.mock.calls[0][0];
        const updatedLists = updateFunction([
            {
                id: 1,
                name: 'List 1',
                tasks: [
                    { id: 1, title: 'Task 1', is_completed: false }, 
                    { id: 2, title: 'Task 2', is_completed: false },
                ],
            },
        ]);

        expect(updatedLists).toEqual([
            {
                id: 1,
                name: 'List 1',
                tasks: [
                    { id: 1, title: 'Task 1', is_completed: true },
                    { id: 2, title: 'Task 2', is_completed: false },
                ],
            },
        ]);

        useToDoList.mockImplementation(() => ({
            lists: updatedLists,
            loading: false,
            setLists: setListsMock,
        }));

        rerender(<ToDoList isShared={false} />);

        await waitFor(() => {
            expect(screen.getByRole('checkbox', { name: /Complete Task 1/i })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: /Complete Task 2/i })).not.toBeChecked(); 
        });
    });

});