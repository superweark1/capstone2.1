import React from 'react';
import "./RegisterAddUSerDashboard.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import RegisterUsers from '../../components/Register/Register-user/RegisterUsers';




const Adduser = () => {
  return (
    <div className='registeradduser-sidebar'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="registeradduser-navbar">
            <Navbar/>
            </div>
            <div className="registeradduser-content">
               <RegisterUsers/>
            </div>
       </div>
      
    </div>
  );
};

export default Adduser;
