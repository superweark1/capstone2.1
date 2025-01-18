import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Scheduler.css"; // Assuming you are using external CSS

const Scheduler = () => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]); // Store notifications

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 4;

  // Function to fetch assignments from the server
  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/assign`
      ); // Adjust URL as per your server
      setAssignments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to fetch assignments.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleGroupSelect = (group) => {
    const selectedGroupData = assignments.find(
      (assignment) => assignment.group_name === group
    );

    if (selectedGroupData) {
      setSelectedGroups((prevSelectedGroups) => {
        const isSelected = prevSelectedGroups.some(
          (g) => g.group_name === group
        );

        if (isSelected) {
          // If already selected, remove from selected groups
          return prevSelectedGroups.filter((g) => g.group_name !== group);
        } else {
          // If not selected, add to selected groups and set the dates
          setStartDate(selectedGroupData.start_date); // Assuming the field name in your data is `start_date`
          setStartTime(selectedGroupData.start_time); // Assuming the field name in your data is `start_time`
          setEndTime(selectedGroupData.end_time); // Assuming the field name in your data is `end_time`
          return [...prevSelectedGroups, selectedGroupData];
        }
      });
    }
  };

  const scheduleMeeting = async () => {
    if (!selectedGroups.length || !startDate) {
      alert("Please select groups and set a start date.");
      return;
    }

    const morningSlots = ["08:00", "09:00", "10:00", "11:00"];
    const afternoonSlots = ["13:00", "14:00", "15:00", "16:00"];
    const availableSlots = [...morningSlots, ...afternoonSlots];
    const rooms = ["CL1", "CL2", "CL3", "CL4"]; // Available rooms

    if (
      selectedGroups.length > availableSlots.length ||
      selectedGroups.length > rooms.length
    ) {
      alert("Not enough available time slots or rooms for all groups.");
      return;
    }

    const shuffledGroups = shuffleArray([...selectedGroups]);
    const shuffledSlots = shuffleArray([...availableSlots]);
    const shuffledRooms = shuffleArray([...rooms]);

    const addOneHour = (time) => {
      let [hour, minute] = time.split(":");
      hour = parseInt(hour);
      minute = parseInt(minute);
      hour = (hour + 1) % 24;
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`;
    };

    const convertTo24HourFormat = (time) => {
      const [hours, minutes] = time.split(":");
      return `${String(hours).padStart(2, "0")}:${minutes}`;
    };

    const convertToDateTimeString = (date, time) => {
      return `${date} ${time}`;
    };

    const groupSchedules = shuffledGroups.map((group, index) => {
      const assignedStartTime = shuffledSlots[index];
      const assignedEndTime = addOneHour(assignedStartTime);
      const assignedRoom = shuffledRooms[index]; // Assign room

      const startTimeFull = convertToDateTimeString(
        startDate,
        assignedStartTime
      );
      const endTimeFull = convertToDateTimeString(startDate, assignedEndTime);

      return {
        group_name: group.group_name,
        name: group.name,
        research_title: group.research_title,
        adviser: group.adviser,
        panel_head: group.panel_head,
        panel_members: Array.isArray(group.panel_members)
          ? group.panel_members.join(", ")
          : group.panel_members || "",
        email: group.email,
        start_date: startDate,
        start_time: convertTo24HourFormat(assignedStartTime),
        end_time: convertTo24HourFormat(assignedEndTime),
        start_time_full: startTimeFull,
        end_time_full: endTimeFull,
        room: assignedRoom, // Add room to schedule
      };
    });

    const scheduleData = {
      groups: groupSchedules,
      startDate: startDate,
      startTime: convertTo24HourFormat(shuffledSlots[0]),
      endTime: convertTo24HourFormat(
        addOneHour(shuffledSlots[selectedGroups.length - 1])
      ),
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/create-scheduler`,
        scheduleData
      );

      selectedGroups.forEach((group) => {
        addNotification(
          `Schedule successfully created for group: ${group.group_name}`
        );
      });

      alert("Schedule successfully created!");
    } catch (error) {
      if (error.response) {
        console.error("Error scheduling meeting:", error.response.data);
        alert(
          `Failed to create schedule: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else {
        console.error("Error scheduling meeting:", error);
        alert("Failed to create schedule due to a network error.");
      }
    }
  };

  // Fisher-Yates shuffle function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
    return array;
  };

  // Extract unique group names from assignments data
  const uniqueGroups = Array.from(
    new Set(assignments.map((assignment) => assignment.group_name))
  );

  // Pagination logic
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentAssignments = assignments.slice(
    indexOfFirstGroup,
    indexOfLastGroup
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(assignments.length / groupsPerPage);

  const addNotification = (message) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/add-notification`, { message })
      .then((response) => console.log("Notification added:", response))
      .catch((error) => console.error("Error adding notification:", error));
  };

  return (
    <div className="scheduler-container">
      <div className="scheduler-container1">
        <h2>Scheduler</h2>
        <div>
          <p>Select Groups:</p>
          <div className="custom-dropdown">
            <button className="dropdown-button">Select Groups</button>
            <div className="dropdown-content">
              {uniqueGroups.length > 0 ? (
                uniqueGroups.map((group) => (
                  <label key={group} className="dropdown-item">
                    <input
                      type="checkbox"
                      value={group}
                      checked={selectedGroups.some(
                        (g) => g.group_name === group
                      )}
                      onChange={() => handleGroupSelect(group)}
                    />
                    {group}
                  </label>
                ))
              ) : (
                <p>No groups available</p>
              )}
            </div>
          </div>
        </div>

        <div className="date-container">
          <p>Set Schedule Date and Time:</p>
          <div className="date-time">
            <label>Start Date:</label>
            <input type="date" onChange={(e) => setStartDate(e.target.value)} />

            <label>Start Time:</label>
            <input type="time" onChange={(e) => setStartTime(e.target.value)} />
          </div>

          <div className="date-time">
            <label>End Time:</label>
            <input type="time" onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <br />
        <div className="button-schedule">
          <button onClick={scheduleMeeting} className="scheduler-button">
            Schedule
          </button>
        </div>
        <br />
      </div>

      {/* Display a loading state or error message if needed */}
      {loading ? (
        <p>Loading assignments...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="responsive-scheduler-table">
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Group Name</th>
                <th>Names</th>
                <th>Research Title</th>
                <th>Adviser</th>
              </tr>
            </thead>
            <tbody>
              {currentAssignments && currentAssignments.length > 0 ? (
                currentAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.group_name}</td>
                    <td>{assignment.name}</td>
                    <td>{assignment.research_title}</td>
                    <td>{assignment.adviser}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No assignments available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination1">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`page-number ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
