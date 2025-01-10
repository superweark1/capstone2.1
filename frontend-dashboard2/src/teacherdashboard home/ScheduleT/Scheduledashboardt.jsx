import React from 'react';
import "./Scheduledashboardt.css";

import Teachersidebar from '../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../teacher components/teacher-navbar/TeacherNavbar';
import ScheduleT from '../../teacher components/teachear-schedule/ScheduleT';


const Scheduledashboardt = () => {
  return (
    <div className='ScheduleStudentDashboard-home-side-container'>
        <Teachersidebar/>
       <div className="wrapper">
        
            <div className="navbar-ScheduleStudentDashboard">
            <TeacherNavbar/>
            </div>
            <div className="ScheduleStudentDashboard-home-content">
                <ScheduleT/>
            </div>
       </div>
      
    </div>
  );
};

export default Scheduledashboardt;