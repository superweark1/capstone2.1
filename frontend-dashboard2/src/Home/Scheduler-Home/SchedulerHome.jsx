import React from 'react';
import "./SchedulerHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Scheduler from '../../components/Scheduler/Scheduler';
import SchedulerTable from '../../components/Scheduler-table/SchedulerTable';




const SchedulerHome = () => {
  return (
    <div className='SchedulerHome'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="scheduler-navbar">
            <Navbar/>
            </div>
            <div className="scheduler-content">
                <Scheduler/>
            </div>
            <div className="scheduler-content2">
              <SchedulerTable/>
            </div>
       </div>
      
    </div>
  );
};

export default SchedulerHome;
