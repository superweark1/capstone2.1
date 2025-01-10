import React from 'react';
import "./TeacherProfilehome.css";


import Teachersidebar from '../../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../../teacher components/teacher-navbar/TeacherNavbar';
import TeacherProfile from '../../../teacher components/Teacher-profile/TeacherProfile/TeacherProfile';




const TeacherProfilehome = () => {
  return (
    <div className='Teachersidebar-Dashboard'>
        <Teachersidebar/>
       <div className="MyProfile-wrapper">
        
            <div className="TeacherNavbar-side3">
            <TeacherNavbar/>
            </div>
            <div className="TeacherProfile-content">
               <TeacherProfile/>
            </div>
       </div>
      
    </div>
  );
};

export default TeacherProfilehome;
