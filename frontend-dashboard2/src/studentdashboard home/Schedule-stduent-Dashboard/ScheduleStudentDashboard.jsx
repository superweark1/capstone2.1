import React from 'react';
import "./ScheduleStudentDashboard.css";
import StudentSidebar from '../../student components/student sidebar/StudentSidebar';
import StudentNavbar from '../../student components/student navbar/StudentNavbar';

import ScheduleStudentPage from '../../student components/Schedule-Student-Page/ScheduleStudentPage';


const ScheduleStudentDashboard = () => {
  return (
    <div className='ScheduleStudentDashboard-home-side-container'>
        <StudentSidebar/>
       <div className="wrapper">
        
            <div className="navbar-ScheduleStudentDashboard">
            <StudentNavbar/>
            </div>
            <div className="ScheduleStudentDashboard-home-content">
                <ScheduleStudentPage/>
            </div>
       </div>
      
    </div>
  );
};

export default ScheduleStudentDashboard;