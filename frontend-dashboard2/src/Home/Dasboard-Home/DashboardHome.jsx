import React from 'react';
import "./DashboardHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Dashboard from '../../components/DashboardPage/Dashboard';




const DashboardHome = () => {
  return (
    <div className="dashboardhomewraper"  >
    <div className='DashboardHomeside-container'>
        <Sidebar/>
       <div className="wrapper" >
        
            <div className="DashboardHomenavbar-side">
            <Navbar/>
            </div>
            <div className="DashboardHomecontent">
                <Dashboard/>
            </div>
       </div>
      
    </div>
    </div>
  );
};

export default DashboardHome;
