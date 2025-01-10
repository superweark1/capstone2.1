import React from 'react';
import "./RegisterUserDashboard.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import RegisterHome from '../../components/Register/Register-Home/RegisterHome';




const RegisterUserDashboard = () => {
  return (
    <div className='register-sidebar'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="register-navbar">
            <Navbar/>
            </div>
            <div className="register-content">
               <RegisterHome/>
            </div>
       </div>
      
    </div>
  );
};

export default RegisterUserDashboard;
