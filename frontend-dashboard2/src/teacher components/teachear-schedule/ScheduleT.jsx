import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './ScheduleT.css';
import Modal from 'react-modal'; // Import react-modal

// Set the app element for accessibility
Modal.setAppElement('#root'); // Make sure to change '#root' to your app's root element if different

// Set up localizer for the calendar
const localizer = momentLocalizer(moment);

const ScheduleT = () => {
  const [view, setView] = useState(Views.MONTH);
  const [highlightedDate, setHighlightedDate] = useState(null);
  const [myEventsList, setMyEventsList] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to fetch events from the backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
      console.log('Fetched events:', response.data);

      // Format events to ensure start and end are Date objects
      const formattedEvents = response.data
        .map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
        .filter(event => event.start && event.end); // Filter out invalid events

      setMyEventsList(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Handle view change
  const handleOnChangeView = (newView) => {
    setView(newView);
  };

  // Handle slot selection (date cell click)
  const handleSelectSlot = (slotInfo) => {
    const { start } = slotInfo;
    setHighlightedDate(start);
  };

  // Custom day cell component
  const CustomDayCell = ({ value, children }) => {
    const isHighlighted = moment(value).isSame(highlightedDate, 'day');

    return (
      <div
        className={`rbc-month-cell ${isHighlighted ? 'highlighted-date' : ''}`}
        onClick={() => setHighlightedDate(value)}
      >
        {children}
      </div>
    );
  };

  // Handle event click to show details
  const handleEventClick = (event) => {
    setSelectedEvent(event); // Set the selected event
    setModalIsOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null); // Clear the selected event
  };

  return (
    <div className='Schedule2'>
      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        views={["month", "day"]}
        view={view}
        onView={handleOnChangeView}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleEventClick} // Add event click handler
        components={{
          month: {
            dateCellWrapper: CustomDayCell,
          },
        }}
        className="calendar2"
      />

      {/* Modal for event details */}
      <Modal 
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        contentLabel="Event Details"
        className="Modal1"
        overlayClassName="Overlay1"
      >
        <h2>Schedule</h2>
        {selectedEvent && (
          <div>
            <p><strong>Group Name:</strong> {selectedEvent.title}</p>
            <p><strong>Name:</strong> {selectedEvent.name}</p>
            <p><strong>Adviser:</strong> {selectedEvent.adviser}</p>
            <p><strong>Panel Head:</strong> {selectedEvent.panel_head}</p>
            <p><strong>Panel Members:</strong> {selectedEvent.panel_members}</p>
            <p><strong>Research Title:</strong> {selectedEvent.research_title}</p>
            <p><strong>Start:</strong> {selectedEvent.start.toString()}</p>
            <p><strong>End:</strong> {selectedEvent.end.toString()}</p>
          </div>
        )}
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default ScheduleT;
