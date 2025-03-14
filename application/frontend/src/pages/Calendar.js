import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getAuthenticatedRequest } from "../utils/authService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import "../styles/calendar.css";

const backendURL = '/events/';

const CalendarPage = () => {
    const [myEvents, setMyEvents] = useState([]);
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventEnd, setEventEnd] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
   
    const location = useLocation();
    const userId = location.state?.userId;

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
            console.error('Error fetching events:', error);
            toast.error('Error fetching events');
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newEvent = {
            title: eventTitle,
            description: eventDescription,
            start: eventStart,
            end: eventEnd,
            // Do NOT include the user field here; the backend will handle it
        };

        console.log("Sending event:", newEvent); // 🔍 Debugging: Log before sending

        try {
            const response = await getAuthenticatedRequest(backendURL, "POST", newEvent);

            if (response) {
                toast.success('Event added successfully');
                closeAddEventPopup();
                fetchEvents(); // Fetch events again to reload the calendar
            } else {
                toast.error('Error saving event.');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Error connecting to backend.');
        }
    };

    const openAddEventPopup = () => {
        console.log('Add Event button func called'); 
        setShowPopup(true);
        console.log('showPopup:', showPopup);
    };

    const closeAddEventPopup = () => {
        setShowPopup(false);
    };

    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
    };

    const closePopup = () => {
        setSelectedEvent(null);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedEvents = myEvents.map(event => {
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);

        let backgroundColor = '#BAD7F2';
        if (eventDate < today) {
            backgroundColor = '#F2BAC9';
        } else if (eventDate.getTime() === today.getTime()) {
            backgroundColor = '#B0F2B4';
        }

        return {
            ...event,
            backgroundColor,
            borderColor: backgroundColor,
            textColor: 'black',
            classNames: ['rounded-event'],
        };
    });



    return (
        <div className='Page'>
            <h1 className='Header'>My Calendar</h1>
            <ToastContainer position='top-center'/>
        
             {
             /* <button className="addeventbutton"onClick={openAddEventPopup}>Add Event</button>
             {showPopup && (
                <div className="event-popup">
                    <div className="popup-content">
                        <h2 className='eventbutton'>Add Event</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Title: </label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Description: </label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Start: </label>
                                <input
                                    type="datetime-local"
                                    value={eventStart}
                                    onChange={(e) => setEventStart(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>End: </label>
                                <input
                                    type="datetime-local"
                                    value={eventEnd}
                                    onChange={(e) => setEventEnd(e.target.value)}
                                />
                            </div>
                            <button type="submit">Save Event</button>
                            <button type="button" onClick={closeAddEventPopup}>Cancel</button>
                        </form>
                    </div>
                </div>
            )} */}

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                events={processedEvents}
                headerToolbar={{
                    left: 'prev,today,next',
                    center: 'title',
                    right: 'addEventButton,timeGridWeek,dayGridMonth,dayGridYear',
                }}
                customButtons={{
                    addEventButton: {
                        text: 'Add Event',
                        // Debugging
                        click: () => { 
                            console.log('Add Event button clicked'); 
                            openAddEventPopup(); // Ensure this is correctly defined
                        },
                    },
                }}
                eventClick={handleEventClick}
            />

            {showPopup && (
                <div className="event-popup">
                    <div className="popup-content">
                        <h2 className="eventbutton">Add Event</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Title: </label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Description: </label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Start: </label>
                                <input
                                    type="datetime-local"
                                    value={eventStart}
                                    onChange={(e) => setEventStart(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>End: </label>
                                <input
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
                        <p><strong>Title:</strong> {selectedEvent.title}</p>
                        <p><strong>Start:</strong> {selectedEvent.start.toLocaleString()}</p>
                        <p><strong>End:</strong> {selectedEvent.end ? selectedEvent.end.toLocaleString() : 'N/A'}</p>
                        <p><strong>Description:</strong> {selectedEvent.extendedProps.description || 'No description available'}</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;