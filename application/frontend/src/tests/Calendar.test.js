import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CalendarPage from '../pages/Calendar';
import { ToastContainer } from 'react-toastify';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock FullCalendar and its plugins
jest.mock('@fullcalendar/react', () => (props) => (
  <div>
    <button onClick={props.customButtons?.addEventButton?.click}>Add Event</button>
    {props.events?.map((event) => (
      <div key={event.id}>{event.title}</div>
    ))}
  </div>
));
jest.mock('@fullcalendar/daygrid', () => () => <div>Mocked DayGridPlugin</div>);
jest.mock('@fullcalendar/timegrid', () => () => <div>Mocked TimeGridPlugin</div>);

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ state: { userId: '123' } }),
}));

describe('CalendarPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial calendar view', () => {
    render(
      <MemoryRouter>
        <CalendarPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Check if the header is rendered
    expect(screen.getByText(/My Calendar/i)).toBeInTheDocument();

    // Check if the "Add Event" button is rendered
    expect(screen.getByText(/Add Event/i)).toBeInTheDocument();
  });

  test('fetches and displays events', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Event 1',
        description: 'Description 1',
        start: '2025-03-16T10:00:00',
        end: '2025-03-16T12:00:00',
      },
    ];
    axios.get.mockResolvedValueOnce({ data: mockEvents });

    render(
      <MemoryRouter>
        <CalendarPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Wait for events to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });
  });

  test('handles adding a new event', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock fetchEvents after adding

    render(
      <MemoryRouter>
        <CalendarPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Open the Add Event popup
    fireEvent.click(screen.getByText(/Add Event/i));

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Title:/i), { target: { value: 'New Event' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/Start:/i), { target: { value: '2025-03-16T10:00' } });
    fireEvent.change(screen.getByLabelText(/End:/i), { target: { value: '2025-03-16T12:00' } });

    // Submit the form
    fireEvent.click(screen.getByText(/Save Event/i));

    // Wait for the success toast
    await waitFor(() => {
      expect(screen.getByText(/Event added successfully/i)).toBeInTheDocument();
    });

    // Ensure the popup is closed
    expect(screen.queryByText(/Add Event/i)).not.toBeInTheDocument();
  });

  test('handles event click and displays event details', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Event 1',
        description: 'Description 1',
        start: '2025-03-16T10:00:00',
        end: '2025-03-16T12:00:00',
      },
    ];
    axios.get.mockResolvedValueOnce({ data: mockEvents });

    render(
      <MemoryRouter>
        <CalendarPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Wait for events to be fetched
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    // Simulate clicking on an event
    fireEvent.click(screen.getByText('Event 1'));

    // Check if event details popup is displayed
    expect(screen.getByText(/Event Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Title:/i)).toBeInTheDocument();
    expect(screen.getByText('Event 1')).toBeInTheDocument();
  });

  test('validates inputs before adding an event', () => {
    render(
      <MemoryRouter>
        <CalendarPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Open the Add Event popup
    fireEvent.click(screen.getByText(/Add Event/i));

    // Submit the form without filling it out
    fireEvent.click(screen.getByText(/Save Event/i));

    // Check for validation error messages
    expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Start date is required/i)).toBeInTheDocument();
  });

  test('handles invalid inputs gracefully', () => {
    render(
      <MemoryRouter>
        <CalendarPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Open the Add Event popup
    fireEvent.click(screen.getByText(/Add Event/i));

    // Enter invalid dates
    fireEvent.change(screen.getByLabelText(/Start:/i), { target: { value: 'invalid-date' } });
    fireEvent.change(screen.getByLabelText(/End:/i), { target: { value: 'invalid-date' } });

    // Submit the form
    fireEvent.click(screen.getByText(/Save Event/i));

    // Check for validation error messages
    expect(screen.getByText(/Invalid date format/i)).toBeInTheDocument();
  });
});