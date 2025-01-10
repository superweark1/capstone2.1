import React from 'react';
import "./ResearchTdash.css";
import Teachersidebar from '../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../teacher components/teacher-navbar/TeacherNavbar';
import TeacherResearch from '../../teacher components/TeacherResearch/TeacherResearch';


const ResearchTdash = () => {
  return (
    <div className=' ResearchStudentDashboard-home-side-container'>
        <Teachersidebar/>
       <div className="wrapper">
        
            <div className="navbar-ResearchStudentDashboard">
            <TeacherNavbar/>
            </div>
            <div className=" ResearchStudentDashboard-home-content">
                <TeacherResearch/>
            </div>
       </div>
      
    </div>
  );
};

export default ResearchTdash;