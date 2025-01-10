import React from 'react';
import "./ScheduleHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Schedule from '../../components/Schedule/Schedule';




const ScheduleHome = () => {
  return (
    <div className='ScheduleHomeside-container2'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="ScheduleHomenavbar-side2">
            <Navbar/>
            </div>
            <div className="ScheduleHomecontent2">
                <Schedule/>
            </div>
       </div>
      
    </div>
  );
};

export default ScheduleHome;
