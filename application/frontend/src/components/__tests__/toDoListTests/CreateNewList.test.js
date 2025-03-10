import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddListModal from "../../ToDoListComponents/CreateNewList";
import * as authService from "../../../pages/utils/authService";

jest.mock("../../../pages/utils/authService", () => ({
    getAuthenticatedRequest: jest.fn(),
}));
describe("CreateNewList", () => {

    let setAddListWindowMock, setListsMock;

    beforeAll(() => {
        global.alert = jest.fn(); // Mock window.alert
        global.console.log = jest.fn(); // Mock window.alert
    });

    afterAll(() => {
        global.alert.mockRestore();
        global.console.log.mockRestore(); // Restore alert after tests
    });

    beforeEach(() => {
        setAddListWindowMock = jest.fn();
        setListsMock = jest.fn();
        jest.clearAllMocks();
    });

    const setup = () => {
        render(
            <AddListModal
                addListWindow={true}
                setAddListWindow={setAddListWindowMock}
                setLists={setListsMock}
            />
        );
    };

    const submitForm = () => {
        const titleInput = screen.getByPlaceholderText("Enter list title");
        const isShared = screen.getByRole("checkbox");

        fireEvent.change(titleInput, { target: { value: "New List" } });
        fireEvent.click(isShared);

        expect(titleInput.value).toBe("New List");
        expect(isShared.checked).toBe(true);

        fireEvent.click(screen.getByText("Save"));
    }

    test("renders modal correctly when addListWindow is true", () => {
        setup();

        expect(screen.getByText("Add List")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter list title")).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    test("does not render modal when addListWindow is false", () => {
        const { container } = render(
            <AddListModal
                addListWindow={false}
                setAddListWindow={setAddListWindowMock}
                setLists={setListsMock}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    test("allows input and submits the form successfully", async () => {
        // Setup mock response
        authService.getAuthenticatedRequest.mockResolvedValue({
            listId: 2,
            name: "New List",
            isShared: true
        });

        // Initialize the mock list state
        let updatedMockLists = [
            { id: 1, name: "List 1", tasks: [] },
        ];

        setListsMock.mockImplementation((updateFunc) => {
            updatedMockLists = updateFunc(updatedMockLists);
        });
        
        setup();
        submitForm();

        await waitFor(() => {
            expect(authService.getAuthenticatedRequest).toHaveBeenCalledWith(
                "/new_list/",
                "POST",
                {
                    name: "New List",
                    is_shared: true,
                }
            );
        });

        // Ensure setListsMock was called
        await waitFor(() => expect(setListsMock).toHaveBeenCalled());

        // Check updated lists correctly
        await waitFor(() => {
            expect(updatedMockLists).toHaveLength(2);
            expect(updatedMockLists[1]).toMatchObject({
                id: 2,
                name: "New List",
                tasks: [],
            });
        });

        // Ensure modal closes
        await waitFor(() => expect(setAddListWindowMock).toHaveBeenCalledWith(false));
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
        expect(setAddListWindowMock).not.toHaveBeenCalled();
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
            // Ensure the alert is called with the error message from the response
            expect(global.alert).toHaveBeenCalledWith("Something went wrong with the request");
        });

        // Check that setLists and setAddTaskWindow were not called
        expect(setListsMock).not.toHaveBeenCalled();
        expect(setAddListWindowMock).not.toHaveBeenCalled();
    });

    test("closes modal on cancel button click", async () => {
        setup();
        const cancelButton = screen.getByText("Cancel");

        fireEvent.click(cancelButton);
        await waitFor(() => expect(setAddListWindowMock).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(setAddListWindowMock).toHaveBeenCalledWith(false));

    });
})