import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./TeacherPresentation.css";
import Modal from "./MOdal";
import TimeEditModal from "./Timeeditmodal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeacherPresentation = () => {
  const [presenterName, setPresenterName] = useState("");
  const [timer, setTimer] = useState("00:00:00"); // HH:MM:SS format
  const [timeLimit, setTimeLimit] = useState("00:00:00"); // Time limit for the presentation in HH:MM:SS format
  const [remainingTime, setRemainingTime] = useState(0); // Time left to count down (in seconds)
  const [isTimerRunning, setIsTimerRunning] = useState(false); // To track if the timer is running
  const [wasTimerStopped, setWasTimerStopped] = useState(false); // To track if the timer was stopped
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [warningMessage, setWarningMessage] = useState(""); // State for warning messages
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false); // State to control the time edit modal
  const [warningShown, setWarningShown] = useState({}); // Track which warnings have been shown

  const intervalRef = useRef(null);
  const [schedulerDate, setSchedulerDate] = useState([]);

  const [groupNames, setGroupNames] = useState([]);
  const [fetchPresentationGroupNames, setPresentationGroupNames] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/assign`
        );
        setGroupNames(response.data); // Assuming response.data contains group names for 'assign'
      } catch (error) {
        console.error("Error fetching group names for assign:", error);
      }
    };

    const fetchPresentationGroupNames = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/schedulerdate`
        );
        setPresentationGroupNames(response.data); // Assuming response.data contains group names for 'schedulerdate'
      } catch (error) {
        console.error("Error fetching group names for schedulerdate:", error);
      }
    };

    fetchGroupNames();
    fetchPresentationGroupNames();
  }, []);

  const handleChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleMembers = () => {
    navigate("/teacher-grading"); // Update with your PanelMembers route
  };

  // Timer functionality
  const startTimer = () => {
    const [hours, minutes, seconds] = "01:15:00".split(":").map(Number); // 1 hour 15 minutes as default
    const totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds; // Convert time to seconds
    setTimeLimit("01:15:00");
    setRemainingTime(totalTimeInSeconds);
    setIsTimerRunning(true);
    setWasTimerStopped(false); // Reset wasTimerStopped when starting
    setWarningShown({}); // Reset warnings
    intervalRef.current = setInterval(updateTimer, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsTimerRunning(false);
    setWasTimerStopped(true); // Mark that the timer was stopped
    setWarningMessage(""); // Clear warning message when timer is stopped
    setIsModalOpen(false); // Close the modal when timer is stopped
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    setWasTimerStopped(false); // Mark that the timer is running
    intervalRef.current = setInterval(updateTimer, 1000);
  };

  const updateTimer = () => {
    setRemainingTime((prevTime) => {
      if (prevTime <= 1) {
        clearInterval(intervalRef.current); // Stop the timer when it reaches zero
        setIsTimerRunning(false);
        setWarningMessage("Time's up!");
        setIsModalOpen(true); // Show the modal when time is up
        return 0;
      } else {
        return prevTime - 1;
      }
    });
  };

  useEffect(() => {
    // Update timer display whenever remainingTime changes
    const hours = Math.floor(remainingTime / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((remainingTime % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingTime % 60).toString().padStart(2, "0");
    setTimer(`${hours}:${minutes}:${seconds}`);

    // Show warnings for 15 minutes and 5 minutes left
    if (remainingTime <= 300 && remainingTime > 0 && !warningShown["5min"]) {
      // 5 minutes (300 seconds)
      setWarningMessage("5 minutes left!");
      setIsModalOpen(true); // Show modal for 5 minutes left warning
      setWarningShown((prev) => ({ ...prev, "5min": true }));
    } else if (
      remainingTime <= 900 &&
      remainingTime > 300 &&
      !warningShown["15min"]
    ) {
      // 15 minutes (900 seconds)
      setWarningMessage("15 minutes left!");
      setIsModalOpen(true); // Show modal for 15 minutes left warning
      setWarningShown((prev) => ({ ...prev, "15min": true }));
    } else if (remainingTime > 900) {
      // Clear warnings if more than 15 minutes
      setWarningMessage("");
    }
  }, [remainingTime, warningShown]);

  const handleTimeLimitChange = (newTimeLimit) => {
    setTimeLimit(newTimeLimit);
    setIsTimeEditModalOpen(false); // Close the time edit modal
  };
  return (
    <div className="TeacherPresentation-container">
      <div className="TeacherPresentationinput1">
        <div className="TeacherPresentationpresent">
          <br />
          <h1>List of Presenters</h1>
          <div className="TeacherPresentationinput-section">
            <div className="TeacherPresentationtable">
              <table>
                <thead>
                  <tr>
                    <th>Group Name</th>
                    <th>Names</th>
                    <th>Research Title</th>
                    <th>Adviser</th>
                    <th>Panel Head</th>
                    <th>Panel Members</th>
                    <th>Presentation date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchPresentationGroupNames.map(
                    (fetchPresentationGroupNames) => (
                      <tr key={fetchPresentationGroupNames.id}>
                        <td>{fetchPresentationGroupNames.group_name}</td>
                        <td>{fetchPresentationGroupNames.name}</td>
                        <td>{fetchPresentationGroupNames.research_title}</td>
                        <td>{fetchPresentationGroupNames.adviser}</td>
                        <td>{fetchPresentationGroupNames.panel_head}</td>
                        <td>{fetchPresentationGroupNames.panel_members}</td>
                        <td>{fetchPresentationGroupNames.start_date}</td>
                        <td>
                          {fetchPresentationGroupNames.start_time} -
                          <br />
                          {fetchPresentationGroupNames.end_time}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <button
            className="TeacherPresentationGradebuttons"
            onClick={handleMembers}
          >
            Grade
          </button>
        </div>
        <div className="TeacherPresentationtimer">
          <div className="TeacherPresentationtimer-section">
            <br />
            <h2>Presentation Timer</h2>
            <div className="TeacherPresentationtimer-flex">
              <button onClick={() => setIsTimeEditModalOpen(true)}>
                Edit Time Limit
              </button>
              <button
                onClick={startTimer}
                disabled={isTimerRunning && !wasTimerStopped}
              >
                Start Time
              </button>
              {isTimerRunning && <button onClick={stopTimer}>Stop Time</button>}
              {!isTimerRunning && wasTimerStopped && (
                <button onClick={resumeTimer}>Resume Time</button>
              )}
              <br />
              <br />
            </div>
            <div className="TeacherPresentationborder">
              <span id="timer">{timer}</span>
              {warningMessage && (
                <div className="TeacherPresentationwarning-message">
                  {warningMessage}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="TeacherPresentationcalendar-section">
          <Calendar onChange={setSelectedDate} value={selectedDate} />
        </div>
        <br />
      </div>
      {/* Render the time edit modal if it is open */}
      {isTimeEditModalOpen && (
        <TimeEditModal
          currentTimeLimit={timeLimit}
          onSave={handleTimeLimitChange}
          onClose={() => setIsTimeEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TeacherPresentation;
