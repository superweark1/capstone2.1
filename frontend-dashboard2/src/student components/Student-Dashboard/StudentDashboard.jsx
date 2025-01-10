import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./StudentDashboard.css";
import { Link } from 'react-router-dom';
import { GiArchiveResearch } from "react-icons/gi";
import { AiOutlineCalendar } from "react-icons/ai";  // Icon for schedule

const StudentDashboard = () => {
  const [researchCount, setResearchCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0);  // State for schedule count

  // Function to fetch data
  const fetchData = (url, setState) => {
    axios.get(url)
      .then(response => setState(response.data.count))
      .catch(error => console.error(`Error fetching data from ${url}:`, error));
  };

  useEffect(() => {
    fetchData('http://localhost:5001/research-count', setResearchCount);
    fetchData('http://localhost:5001/schedule-count', setScheduleCount);  // Fetch schedule count
  }, []);

  return (
    <div className='dashboard-container'>
      <div className="card-page">
        <Card
          icon={<GiArchiveResearch />}
          title="Research"
          count={researchCount}
          link="/student-Research"
        />
        <Card
          icon={<AiOutlineCalendar />}  // Icon for schedule
          title="Schedule"
          count={scheduleCount}  // Display schedule count
          link="/student-Schedule"
        />
      </div>
    </div>
  );
};

// Reusable Card component for consistency
const Card = ({ icon, title, count, link }) => (
  <div className="card">
    <div className='box'>
      <span className='box-icon'>{icon}</span>
    </div>
    <div className='card-name'>
      <h1 className='hh1'>{title}</h1>
      <p className='count'>{count}</p>
      <Link to={link}>
        <span>See All</span>
      </Link>
    </div>
  </div>
);

export default StudentDashboard;
