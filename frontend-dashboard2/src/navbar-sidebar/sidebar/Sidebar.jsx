import React, { useState } from 'react';
import './Sidebar.css';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { MdPerson } from "react-icons/md";
import { MdOutlineAssignment } from "react-icons/md";
import { AiOutlineSchedule } from "react-icons/ai";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { RiPresentationFill } from "react-icons/ri";
import { GiArchiveResearch } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";

const Sidebar = () => {
  const [showScheduleItems, setShowScheduleItems] = useState(false);
  const [showPresentationItems, setShowPresentationItems] = useState(false);

  const handleScheduleClick = () => {
    setShowScheduleItems(!showScheduleItems); // Toggle the visibility of Schedule items
  };

  const handlePresentationClick = () => {
    setShowPresentationItems(!showPresentationItems); // Toggle the visibility of Presentation items
  };

  return (
    <div className='side-container'>
      <div className="sidebar">
        <div className="text">
          <ul>
            <Link to="/dashboard">
              <li>
                <Button>
                  <span><FaHome/></span>Home
                </Button>
              </li>
            </Link>
            <Link to="/student">
              <li>
                <Button>
                  <span><PiStudentBold/></span>Student
                </Button>
              </li>
            </Link>
            <Link to="/teacher">
              <li>
                <Button>
                  <span><MdPerson/></span>Teacher
                </Button>
              </li>
            </Link>
            <Link to="/assign">
              <li>
                <Button>
                  <span><MdOutlineAssignment/></span>Assign
                </Button>
              </li>
            </Link>

            {/* Schedule with expanding items */}
            <li>
              <Button
                onClick={handleScheduleClick}
                className={showScheduleItems ? 'active-schedule' : ''}
              >
                <span><AiOutlineSchedule/></span>Schedule
              </Button>
            </li>
            {showScheduleItems && (
              <>
                <li>
                  <Link to="/Schedule">
                    <Button>
                      <span><IoCalendarNumberOutline/></span>Schedule Calendar
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="/Scheduler">
                    <Button>
                      <span><BsFillPersonLinesFill/></span>Scheduler
                    </Button>
                  </Link>
                </li>
              </>
            )}

            {/* Presentation with expanding items */}
            <li>
              <Button
                onClick={handlePresentationClick}
                className={showPresentationItems ? 'active-presentation' : ''}
              >
                <span><RiPresentationFill/></span>Presentation
              </Button>
            </li>
            {showPresentationItems && (
              <>
                <li>
                  <Link to="/Presentation">
                    <Button>
                      <span><RiPresentationFill/></span>Presentation Section
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="/Presentation/Grade">
                    <Button>
                      <span><RiPresentationFill/></span>Grade
                    </Button>
                  </Link>
                </li>
              </>
            )}

            <Link to="/Research">
              <li>
                <Button>
                  <span><GiArchiveResearch/></span>Research
                </Button>
              </li>
            </Link>
            <Link to="/User">
              <li>
                <Button>
                  <span><FaRegUser/></span>Registered User
                </Button>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
