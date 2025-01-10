import React from 'react';
import "./MyProfileDashboard.css";


import MyProfile from '../../../components/Profile/My-profile/MyProfile';
import Navbar from '../../../navbar-sidebar/navbar/Navbar';
import Sidebar from '../../../navbar-sidebar/sidebar/Sidebar';




const MyProfileDashboard = () => {
  return (
    <div className='MyProfile-Dashboard'>
        <Sidebar/>
       <div className="MyProfile-wrapper">
        
            <div className="MyProfile-side3">
            <Navbar/>
            </div>
            <div className="MyProfile-content">
               <MyProfile/>
            </div>
       </div>
      
    </div>
  );
};

export default MyProfileDashboard;
