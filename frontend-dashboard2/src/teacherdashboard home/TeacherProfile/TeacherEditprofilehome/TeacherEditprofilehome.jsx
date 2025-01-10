import React from 'react';
import "./TeacherEditprofilehome.css";


import Teachersidebar from '../../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../../teacher components/teacher-navbar/TeacherNavbar';
import TeacherEditprofile from '../../../teacher components/Teacher-profile/TeacherEditprofile/TeacherEditprofile';




const TeacherEditprofilehome = () => {
  return (
    <div className='TeacherEditprofilehome-Dashboard'>
        <Teachersidebar/>
       <div className="MyProfile-wrapper">
        
            <div className="TeacherEditprofilehome-side3">
            <TeacherNavbar/>
            </div>
            <div className="TeacherEditprofilehome-content">
               <TeacherEditprofile/>
            </div>
       </div>
      
    </div>
  );
};

export default TeacherEditprofilehome;
