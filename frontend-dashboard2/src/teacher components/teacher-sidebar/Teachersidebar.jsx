import React, { useState } from 'react';
import "./Teachersidebar.css";
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { MdPerson } from "react-icons/md";
import { GiArchiveResearch } from "react-icons/gi";
import { RiPresentationFill } from "react-icons/ri";

const Teachersidebar = () => {
  const [showPresentationItems, setShowPresentationItems] = useState(false);

  const handlePresentationClick = () => {
    setShowPresentationItems(!showPresentationItems); // Toggle the visibility of Presentation items
  };

  return (
    <div className='teacher-sidebar-side-container'>
      <div></div>

      <div className="teacher-sidebar-sidebar">
        <div className="teachertext">
          <ul>
            <Link to="/teacher-Dashboard">
              <li>
                <Button><span><FaHome/></span>Home</Button>
              </li>
            </Link>
            <Link to="/teacher-assign">
              <li>
                <Button><span><MdOutlineAssignment/></span>Assign</Button>
              </li>
            </Link>
            <Link to="/teacher-schedule">
              <li>
                <Button><span><IoCalendarNumberOutline/></span>Schedule</Button>
              </li>
            </Link>

            {/* Presentation with Grade Dropdown */}
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
                  <Link to="/teacher-presentation">
                    <Button>
                      <span><RiPresentationFill/></span>Presentation Section
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="/teacher-grading">
                    <Button>
                      <span><RiPresentationFill/></span>Grade
                    </Button>
                  </Link>
                </li>
              </>
            )}

            <Link to="/teacher-Research">
              <li>
                <Button><span><GiArchiveResearch/></span>Research</Button>
              </li>
            </Link>
            <Link to="/teacher-Profile">
              <li>
                <Button><span><MdPerson/></span>Profile</Button>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Teachersidebar;
