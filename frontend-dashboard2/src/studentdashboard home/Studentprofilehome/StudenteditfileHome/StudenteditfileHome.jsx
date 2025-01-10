import React from 'react';
import "./StudenteditfileHome.css";



import Studenteditprofile from '../../../student components/StudentProfile/Studenteditprofile/Studenteditprofile';
import StudentSidebar from '../../../student components/student sidebar/StudentSidebar';
import StudentNavbar from '../../../student components/student navbar/StudentNavbar';




const StudenteditfileHome = () => {
  return (
    <div className='StudenteditfileHome-Dashboard'>
        <StudentSidebar/>
       <div className="MyProfile-wrapper">
        
            <div className="StudenteditfileHome-side3">
            <StudentNavbar/>
            </div>
            <div className="StudenteditfileHome-content">
               <Studenteditprofile/>
            </div>
       </div>
      
    </div>
  );
};

export default StudenteditfileHome;
