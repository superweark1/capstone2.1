import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Teachersdashboard.css";
import { Link } from "react-router-dom";
import { GiArchiveResearch } from "react-icons/gi";
import { AiOutlineCalendar } from "react-icons/ai"; // Icon for schedule

const Teachersdashboard = () => {
  const [researchCount, setResearchCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0); // State for schedule count

  // Function to fetch data
  const fetchData = (url, setState) => {
    axios
      .get(url)
      .then((response) => setState(response.data.count))
      .catch((error) =>
        console.error(`Error fetching data from ${url}:`, error)
      );
  };

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}/research-count`,
      setResearchCount
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}/schedule-count`,
      setScheduleCount
    ); // Fetch schedule count
  }, []);

  return (
    <div className="Teachersdashboard-container">
      <div className="Teacherscard-page">
        <Card
          icon={<GiArchiveResearch />}
          title="Research"
          count={researchCount}
          link="/research"
        />
        <Card
          icon={<AiOutlineCalendar />} // Icon for schedule
          title="Schedule"
          count={scheduleCount} // Display schedule count
          link="/schedule"
        />
      </div>
    </div>
  );
};

// Reusable Card component for consistency
const Card = ({ icon, title, count, link }) => (
  <div className="Teacherscard">
    <div className="Teachersbox">
      <span className="Teachersbox-icon">{icon}</span>
    </div>
    <div className="Teacherscard-name">
      <h1 className="Teachershh1">{title}</h1>
      <p className="Teacherscount">{count}</p>
      <Link to={link}>
        <span>See All</span>
      </Link>
    </div>
  </div>
);

export default Teachersdashboard;
