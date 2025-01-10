import React from 'react';
import "./StudentSidebar.css";
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { MdPerson } from "react-icons/md";
import { GiArchiveResearch } from "react-icons/gi";

const StudentSidebar = () => {
  return (
    <div className='StudentSidebar-side-container'>
        <div>
        </div>
        <div className="StudentSidebar-sidebar">
            <div className="text1">
            <ul>
                <Link to="/student-Dashboard">
                <li>
                <Button>
                <span><FaHome/></span>Home</Button>
                </li>
                </Link>
                <Link to="/Assigned">
                <li>
                <Button>
                <span><MdOutlineAssignment/></span>
                Assign</Button>
                </li>
                </Link>
                <Link to="/student-Schedule">
                <li>
                    <Button><span><IoCalendarNumberOutline/></span>Schedule </Button>
                </li>
                </Link>
                <Link to="/student-Research">
                <li>
                    <Button><span><GiArchiveResearch/></span>Research</Button>
                </li>
                </Link>
                <Link to="/student-profile">
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

export default StudentSidebar;
