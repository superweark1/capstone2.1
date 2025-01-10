import React from 'react';
import "./EditProfileDashboard.css";
import Navbar from '../../../navbar-sidebar/navbar/Navbar';
import Sidebar from '../../../navbar-sidebar/sidebar/Sidebar';
import EditPRofile from '../../../components/Profile/Edit-profile/EditPRofile';




const EditProfileDashboard = () => {
  return (
    <div className='EditProfile-Dashboard'>
        <Sidebar/>
       <div className="EditProfile-wrapper">
        
            <div className="editProfile-side3">
            <Navbar/>
            </div>
            <div className="editProfile-content">
               <EditPRofile/>
            </div>
       </div>
      
    </div>
  );
};

export default EditProfileDashboard;
