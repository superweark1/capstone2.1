import React from 'react';
import "./StudentprofileHome.css";


import StudentSidebar from '../../../student components/student sidebar/StudentSidebar';
import StudentNavbar from '../../../student components/student navbar/StudentNavbar';
import Studentprofile from '../../../student components/StudentProfile/Studentprofile/Studentprofile';




const StudentprofileHome = () => {
  return (
    <div className='StudentprofileHome-Dashboard'>
        <StudentSidebar/>
       <div className="MyProfile-wrapper">
        
            <div className="StudentprofileHome-side3">
            <StudentNavbar/>
            </div>
            <div className="StudentprofileHome-content">
               <Studentprofile/>
            </div>
       </div>
      
    </div>
  );
};

export default StudentprofileHome;
