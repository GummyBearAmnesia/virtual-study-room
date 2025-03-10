import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTaskModal from "../../ToDoListComponents/CreateNewTask";
import * as authService from "../../../pages/utils/authService";

jest.mock("../../../pages/utils/authService", () => ({
    getAuthenticatedRequest: jest.fn(),
}));

describe("CreateNewTask", () => {

    let setAddTaskWindowMock, setListsMock;

    beforeAll(() => {
        global.alert = jest.fn(); // Mock window.alert
        global.console.log = jest.fn(); // Mock window.alert
    });

    afterAll(() => {
        global.alert.mockRestore();
        global.console.log.mockRestore(); // Restore alert after tests
    });

    beforeEach(() => {
        setAddTaskWindowMock = jest.fn();
        setListsMock = jest.fn();
        jest.clearAllMocks();
    });

    const setup = () => {
        render(
            <AddTaskModal
                addTaskWindow={true}
                setAddTaskWindow={setAddTaskWindowMock}
                listId={1}
                setLists={setListsMock}
            />
        );
    };

    const submitForm = () => {

        const titleInput = screen.getByPlaceholderText("Enter task title");
        const contentInput = screen.getByPlaceholderText("Enter task content");

        fireEvent.change(titleInput, { target: { value: "New Task" } });
        fireEvent.change(contentInput, { target: { value: "Task details" } });

        expect(titleInput.value).toBe("New Task");
        expect(contentInput.value).toBe("Task details");

        fireEvent.click(screen.getByText("Save"));
    }

    test("renders modal correctly when addTaskWindow is true", () => {
        setup();

        expect(screen.getByText("Add Task")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter task title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter task content")).toBeInTheDocument();
    });

    test("does not render modal when addTaskWindow is false", () => {
        const { container } = render(
            <AddTaskModal
                addTaskWindow={false}
                setAddTaskWindow={setAddTaskWindowMock}
                listId={1}
                setLists={setListsMock}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    test("allows input and submits the form successfully", async () => {
        // Setup mock response
        authService.getAuthenticatedRequest.mockResolvedValue({
            id: 1,
            title: "New Task",
            content: "Task details",
            is_completed: false,
        });

        let updatedMockLists = [
            { id: 1, name: "List 1", tasks: [] },
            { id: 2, name: "List 2", tasks: [] },
        ];

        setListsMock.mockImplementation((updateFunc) => {
            const cloneList = JSON.parse(JSON.stringify(updatedMockLists));
            updatedMockLists = updateFunc(cloneList);
        });

        setup();
        submitForm();

        await waitFor(() => {
            expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
                "/new_task/",
                "POST",
                {
                    list_id: 1,
                    title: "New Task",
                    content: "Task details",
                }
            );
            
        });

        // Ensure setListsMock was called
        await waitFor(() => expect(setListsMock).toHaveBeenCalled());

        // Check updated lists
        await waitFor(() => {
            expect(updatedMockLists[0].tasks).toHaveLength(1);
            expect(updatedMockLists[0].tasks[0]).toMatchObject({
                id: 1,
                title: "New Task",
                content: "Task details",
            });
        });

        // Ensure modal closes
        await waitFor(() => expect(setAddTaskWindowMock).toHaveBeenCalledWith(false));
    });

    test("handles generic error without response", async () => {
        // Simulate a generic error without response data
        authService.getAuthenticatedRequest.mockRejectedValueOnce({
            message: "Network Error",
        });

        setup();
        submitForm();

        await waitFor(() => {
            expect(authService.getAuthenticatedRequest).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("An error occurred. Please try again.");
        });
        expect(setListsMock).not.toHaveBeenCalled();
        expect(setAddTaskWindowMock).not.toHaveBeenCalled();
    });

    test("handles error with response", async () => {
        // Simulate an error with a response object containing an error message
        authService.getAuthenticatedRequest.mockRejectedValueOnce({
            response: {
                data: {
                    error: "Something went wrong with the request",
                },
            },
        });

        setup();
        submitForm();

        await waitFor(() => {
            expect(authService.getAuthenticatedRequest).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Something went wrong with the request");
        });

        // Check that setLists and setAddTaskWindow were not called
        expect(setListsMock).not.toHaveBeenCalled();
        expect(setAddTaskWindowMock).not.toHaveBeenCalled();
    });

    test("closes modal on cancel button click", async() => {
        setup();
        const cancelButton = screen.getByText("Cancel");

        fireEvent.click(cancelButton);
        await waitFor(() => expect(setAddTaskWindowMock).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(setAddTaskWindowMock).toHaveBeenCalledWith(false));

    });
})