import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SchedukerTable.css";

const SchedulerTable = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/data`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleUpdateClick = (item) => {
    setCurrentItem(item);
    setModalOpen(true);
  };

  // Notification function to send a notification
  const addNotification = (message) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/add-notification`, { message })
      .then((response) => console.log("Notification added:", response))
      .catch((error) => console.error("Error adding notification:", error));
  };

  const handleUpdate = async (updatedItem) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/data/${updatedItem.id}`,
        updatedItem
      );

      // Update data locally after the backend update
      setData((prevData) =>
        prevData.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );

      // Add notification after successful update
      const notificationMessage = `Schedule for group '${updatedItem.group_name}' updated successfully!`;
      addNotification(notificationMessage);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/data/${id}`);
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const Modal = ({ isOpen, onClose, data, onUpdate }) => {
    const [name, setName] = useState(data?.name || "");
    const [startDate, setStartDate] = useState(data?.start_date || "");
    const [startTime, setStartTime] = useState(data?.start_time || ""); // Ensure valid format
    const [endTime, setEndTime] = useState(data?.end_time || ""); // Ensure valid format

    useEffect(() => {
      if (data) {
        setName(data.name);
        setStartDate(data.start_date);
        setStartTime(data.start_time || ""); // Default to empty string if not available
        setEndTime(data.end_time || ""); // Default to empty string if not available
      }
    }, [data]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!startTime || !endTime) {
        alert("Please provide valid start and end times.");
        return;
      }

      // Convert to 24-hour format if needed
      const formattedStartTime = convertTo24HourFormat(startTime);
      const formattedEndTime = convertTo24HourFormat(endTime);

      onUpdate({
        ...data,
        name,
        start_date: startDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });

      onClose();
    };

    if (!isOpen) return null;

    const convertTo24HourFormat = (time) => {
      const [hourMin, period] = time.split(" "); // Split time and period (AM/PM)
      const [hour, minute] = hourMin.split(":");
      let hours = parseInt(hour);

      // Convert to 24-hour format based on AM/PM
      if (period === "PM" && hours < 12) {
        hours += 12; // Convert PM to 24-hour time
      }
      if (period === "AM" && hours === 12) {
        hours = 0; // Convert 12 AM to 00
      }

      return `${String(hours).padStart(2, "0")}:${minute}`; // Return formatted time
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Update Schedule</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              Start Time:
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
            <div className="modalSchedulerUpdate">
              <button type="submit">Update</button>
              <button type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const formatTimeWithAMPM = (time) => {
    console.log("Time received:", time); // Log the time received

    if (!time) return "Invalid time"; // Handle empty time cases

    // Check if the time is in a valid format (HH:mm)
    const timeParts = time.split(":");
    if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
      console.log("Invalid time format:", time); // Log invalid time format
      return "Invalid time";
    }

    const [hour, minute] = timeParts;

    // Ensure the hour and minute are within valid ranges
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.log("Invalid time range:", time); // Log invalid time range
      return "Invalid time";
    }

    const date = new Date();
    date.setHours(hour, minute);

    // Check if the Date object is valid
    if (isNaN(date.getTime())) {
      console.log("Date object is invalid:", date); // Log invalid date object
      return "Invalid time";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="SchedulerTable-container1">
      <table className="SchedulerTable">
        <thead>
          <tr>
            <th>No</th>
            <th>Group Name</th>
            <th>Name</th>
            <th>Start Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={item.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{item.group_name}</td>
              <td>{item.name}</td>
              <td>{item.start_date}</td>
              <td>{formatTimeWithAMPM(item.start_time)}</td>
              <td>{formatTimeWithAMPM(item.end_time)}</td>
              <td>
                <div className="schedulerUpdateButton">
                  <button onClick={() => handleUpdateClick(item)}>
                    Update
                  </button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="schedulerpagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        data={currentItem}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default SchedulerTable;
