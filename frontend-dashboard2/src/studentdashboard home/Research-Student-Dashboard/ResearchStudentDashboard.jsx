import React from 'react';
import "./ResearchStudentDashboard.css";
import StudentSidebar from '../../student components/student sidebar/StudentSidebar';
import StudentNavbar from '../../student components/student navbar/StudentNavbar';

import ScheduleStudentPage from '../../student components/Schedule-Student-Page/ScheduleStudentPage';
import ResearchStudentPage from '../../student components/Research-Student-Page/ResearchStudentPage';


const ResearchStudentDashboard = () => {
  return (
    <div className=' ResearchStudentDashboard-home-side-container'>
        <StudentSidebar/>
       <div className="wrapper">
        
            <div className="navbar-ResearchStudentDashboard">
            <StudentNavbar/>
            </div>
            <div className=" ResearchStudentDashboard-home-content">
                <ResearchStudentPage/>
            </div>
       </div>
      
    </div>
  );
};

export default ResearchStudentDashboard;