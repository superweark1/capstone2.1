import React from 'react';
import "./Teacheruserhome.css";
import Teachersidebar from '../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../teacher components/teacher-navbar/TeacherNavbar';
import Teachersdashboard from '../../teacher components/Teacher-dashboard/Teachersdashboard';




const Teacheruserhome = () => {
  return (
    <div className='teacheruserhome-side-container'>
        <Teachersidebar/>
       <div className="wrapper">
        
            <div className="teacheruserhome-navbar-side">
            <TeacherNavbar/>
            </div>
            <div className="teacheruserhome-content">
                <Teachersdashboard/>
            </div>
       </div>
      
    </div>
  );
};

export default Teacheruserhome;