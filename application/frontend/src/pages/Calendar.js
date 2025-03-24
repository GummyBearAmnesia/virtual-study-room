import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { getAuthenticatedRequest } from "../utils/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import "../styles/calendar.css";
import { useNavigate } from "react-router-dom";
import returnHomeLogo from "../assets/return_home.png";

console.log(require.resolve("@fullcalendar/react"));

const backendURL = "/events/";

const CalendarPage = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const userId = location.state?.userId;

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  if (!userId) {
    console.error("User ID is undefined. Redirecting or handling error...");
    // Optionally, redirect the user or show an error message
  }

  const fetchEvents = async () => {
    try {
      const response = await getAuthenticatedRequest(backendURL, "GET");
      console.log("Fetched events:", response); // 🔍 Debugging: Log fetched events
      setMyEvents(response); // Set the events directly (backend already filters by user)
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set description to "No description available" if empty
    const description = eventDescription.trim() || "No description available";

    const newEvent = {
      title: eventTitle,
      description: description,
      start: eventStart,
      end: eventEnd,
      // Do NOT include the user field here; the backend will handle it
    };

    console.log("Sending event:", newEvent); // 🔍 Debugging: Log before sending

    try {
      const response = await getAuthenticatedRequest(
        backendURL,
        "POST",
        newEvent
      );

      if (response) {
        toast.success("Event added successfully"); 
        closeAddEventPopup(); 
        fetchEvents(); // Fetch events again to reload the calendar 
      } else {
        toast.error("Error saving event.");
      }
    } catch (error) {
      console.error("Error saving event:", error); 
      toast.error("Error connecting to backend."); 
    }
  };

  const openAddEventPopup = () => {
    console.log("Add Event button func called");
    setShowPopup(true);
    console.log("showPopup:", showPopup);
  };

  const closeAddEventPopup = () => {
    setShowPopup(false); 
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event); //----------------------------------------
  };

  const closePopup = () => {
    setSelectedEvent(null); //-------------------------------------
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const processedEvents = myEvents.map((event) => {
    const eventDate = new Date(event.start);
    eventDate.setHours(0, 0, 0, 0);

    let backgroundColor = "#BAD7F2";
    if (eventDate < today) {
      backgroundColor = "#F2BAC9"; //----------------------------------------------
    } else if (eventDate.getTime() === today.getTime()) {
      backgroundColor = "#B0F2B4";  //-----------------------------------------------
    }

    return {
      ...event,
      backgroundColor,
      borderColor: backgroundColor,
      textColor: "black",
      classNames: ["rounded-event"],
    };
  });

  return (
    <div className="Page">
      <h1 className="Header">
        My Calendar
        <div className="top-bar">
          <button onClick={goToDashboard} className="dashboard-button">
            <img src={returnHomeLogo} alt="return" />
          </button>
        </div>
      </h1>
      <ToastContainer position="top-center" />
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={processedEvents}
        headerToolbar={{
          left: `
            <button aria-label="prev" id="prev-button">Prev</button>
            <button aria-label="today" id="today-button">Today</button>
            <button aria-label="next" id="next-button">Next</button>
          `,
          center: 'title',
          right: `
            <button aria-label="add-event">Add Event</button>
            <button aria-label="week-view">Week View</button>
            <button aria-label="month-view">Month View</button>
          `
        }}
        customButtons={{
          addEventButton: {
            text: "Add Event",
            // Debugging
            click: () => {
              console.log("Add Event button clicked");
              openAddEventPopup(); // Ensure this is correctly defined
            },
          },
        }}
        eventClick={handleEventClick}
      />

      {showPopup && (
        <div className="event-popup">
          <div className="popup-content">
            <h2>Add Event</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="eventTitle">Title:</label>
                <input
                  id="eventTitle"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eventDescription">Description:</label>
                <textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="eventStart">Start:</label>
                <input
                  id="eventStart"
                  type="datetime-local"
                  value={eventStart}
                  onChange={(e) => setEventStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eventEnd">End:</label>
                <input
                  id="eventEnd"
                  type="datetime-local"
                  value={eventEnd}
                  onChange={(e) => setEventEnd(e.target.value)}
                />
              </div>
              <button type="submit">Save Event</button>
              <button type="button" onClick={closeAddEventPopup}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="event-popup">
          <div className="popup-content">
            <h2>Event Details</h2>
            <p>
              <strong>Title:</strong> {selectedEvent.title}
            </p>
            <p>
              <strong>Start:</strong> {selectedEvent.start.toLocaleString()}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {selectedEvent.end ? selectedEvent.end.toLocaleString() : "N/A"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selectedEvent.extendedProps.description ||
                "No description available"}
            </p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
