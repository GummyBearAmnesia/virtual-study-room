import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "../pages/Signup";
import { BrowserRouter } from "react-router-dom";
import axios from "axios"; // Import axios
import { cleanup } from "@testing-library/react";

//npx jest --coverage

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

describe("SignUpForm", () => {
  ///jest.mock("axios");

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error to prevent actual logging
    jest.spyOn(window, "alert").mockImplementation(() => {}); // Mock alert
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Clean up mocks after each test
    cleanup();
  });

  test("renders form correctly", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
    const firstname = screen.getByLabelText("First name:");
    expect(firstname).toBeInTheDocument();

    const lastname = screen.getByLabelText("Last name:");
    expect(lastname).toBeInTheDocument();

    const username = screen.getByLabelText("Username:");
    expect(username).toBeInTheDocument();

    const email = screen.getByLabelText("Email:");
    expect(email).toBeInTheDocument();

    const password1 = screen.getByLabelText("Password:");
    expect(password1).toBeInTheDocument();

    const password2 = screen.getByLabelText("Confirm password:");
    expect(password2).toBeInTheDocument();

    const checkbox = screen.getByLabelText("I accept the terms and conditions");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });
    expect(buttonElement).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const firstname = screen.getByLabelText("First name:");
    const lastname = screen.getByLabelText("Last name:");
    const username = screen.getByLabelText("Username:");
    const email = screen.getByLabelText("Email:");
    const password1 = screen.getByLabelText("Password:");
    const password2 = screen.getByLabelText("Confirm password:");
    const checkbox = screen.getByLabelText("I accept the terms and conditions");

    fireEvent.change(firstname, { target: { value: "John" } });
    fireEvent.change(lastname, { target: { value: "Doe" } });
    fireEvent.change(username, { target: { value: "johndoe" } });
    fireEvent.change(email, { target: { value: "johndoe@gmail.com" } });
    fireEvent.change(password1, { target: { value: "Qa1" } });
    fireEvent.change(password2, { target: { value: "Qa1" } });
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    expect(firstname.value).toBe("John");
    expect(lastname.value).toBe("Doe");
    expect(username.value).toBe("johndoe");
    expect(email.value).toBe("johndoe@gmail.com");
    expect(password1.value).toBe("Qa1");
    expect(password2.value).toBe("Qa1");
  });

  const fillAndSubmitForm = async (acceptTerms = false) => {
    const firstname = screen.getByLabelText("First name:");
    const lastname = screen.getByLabelText("Last name:");
    const username = screen.getByLabelText("Username:");
    const email = screen.getByLabelText("Email:");
    const password1 = screen.getByLabelText("Password:");
    const password2 = screen.getByLabelText("Confirm password:");
    const checkbox = screen.getByLabelText("I accept the terms and conditions");

    fireEvent.change(firstname, { target: { value: "John" } });
    fireEvent.change(lastname, { target: { value: "Doe" } });
    fireEvent.change(username, { target: { value: "@john789" } });
    fireEvent.change(email, { target: { value: "johndoe@gmail.com" } });
    fireEvent.change(password1, { target: { value: "Qa1" } });
    fireEvent.change(password2, { target: { value: "Qa1" } });

    if (acceptTerms) {
      fireEvent.click(checkbox);
    }

    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });
    fireEvent.click(buttonElement);

    return; // return elements in case you want to use them in tests
  };

  test("shows alert if terms and conditions are not accepted", async () => {
    axios.post.mockResolvedValueOnce({
      data: { message: "User registered successfully!" },
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
    await fillAndSubmitForm(false);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "You must accept the terms and conditions."
      );
    });
  });

  const submitFormSuccessfully = async () => {
    axios.post.mockResolvedValueOnce({
      data: { message: "User registered successfully!" },
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
    await fillAndSubmitForm(true);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "User registered successfully!"
      );
    });
  };

  test("submits form successfully after accepting terms", async () => {
    await submitFormSuccessfully();
  });

  test("shows message if email is already in use", async () => {
    axios.get.mockImplementation((url, { params }) => {
      if (url.includes("/api/check-email/")) {
        return Promise.resolve({ data: { exists: true } }); // Force email to be "already taken"
      }
      return Promise.resolve({ data: {} });
    });

    submitFormSuccessfully();

    const email = screen.getByLabelText("Email:");
    fireEvent.change(email, { target: { value: "johndoe@example.com" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });
    fireEvent.click(buttonElement);

    await waitFor(async () => {
      expect(await screen.getByTestId("error-message-email")).toHaveTextContent(
        "This email is already taken, please enter another"
      );
    });
  });

  test("shows message if password do not match", async () => {
    submitFormSuccessfully();

    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: "Passwords do not match",
        },
      },
    });

    const password1 = screen.getByLabelText("Confirm password:");
    fireEvent.change(password1, { target: { value: "Password" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(
        screen.getByTestId("error-message-passwordConfirmation")
      ).toHaveTextContent("Password confirmation needs to match password");
    });
  });

  test("shows message if empty username is wrong", async () => {
    submitFormSuccessfully();

    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    const username = screen.getByLabelText("Username:");
    fireEvent.change(username, { target: { value: "" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });

    await waitFor(() => {
      fireEvent.click(buttonElement);
      expect(screen.getByTestId("error-message-username")).toHaveTextContent(
        "Username is required"
      );
    });
  });

  test("shows message if username is in the wrong format", async () => {
    submitFormSuccessfully();

    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    const username = screen.getByLabelText("Username:");
    fireEvent.change(username, { target: { value: "testUsername" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });

    await waitFor(() => {
      fireEvent.click(buttonElement);
      expect(screen.getByTestId("error-message-username")).toHaveTextContent(
        "Username must consist of @ followed by at least three alphanumericals"
      );
    });
  });

  test("shows message if password does not meet criteria", async () => {
    submitFormSuccessfully();

    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: "Password is not in the correct format",
        },
      },
    });

    const password1 = screen.getByLabelText("Password:");
    fireEvent.change(password1, { target: { value: "Password" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(screen.getByTestId("error-message-password")).toHaveTextContent(
        "Password must contain an uppercase character, a lowercase character, and a number."
      );
    });
  });

  test("shows message if email is in the wrong format", async () => {
    submitFormSuccessfully();

    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    const username = screen.getByLabelText("Email:");
    fireEvent.change(username, { target: { value: "testEmail" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });

    await waitFor(() => {
      fireEvent.click(buttonElement);
      expect(screen.getByTestId("error-message-email")).toHaveTextContent(
        "Invalid email format"
      );
    });
  });
  /*
  test("shows message if username is already in use", async () => {
    submitFormSuccessfully();

    axios.get.mockImplementation((url, { params }) => {
      if (url.includes("/api/check-email/")) {
        return Promise.resolve({ data: { exists: true } }); // Force email to be "already taken"
      }
      return Promise.resolve({ data: {} });
    });

    const username = screen.getByLabelText("Username:");
    fireEvent.change(username, { target: { value: "@john789" } });
    const buttonElement = screen.getByRole("button", { name: "SIGNUP" });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(screen.getByTestId("error-message-username")).toHaveTextContent(
        "This username is already taken, please enter another"
      );
    });
  });
  */
});
