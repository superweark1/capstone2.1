import React from 'react';
import "./Assigndasboardt.css";
import Teachersidebar from '../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../teacher components/teacher-navbar/TeacherNavbar';
import Assignstudents from '../../teacher components/Assign-studentsdashboard/Assignstudents';





const Assigndasboardt = () => {
  return (
    <div className='AssignStudentPage-home-side-container'>
        <Teachersidebar/>
       <div className="wrapper">
        
            <div className="navbar-AssignStudentPage">
            <TeacherNavbar/>
            </div>
            <div className="AssignStudentPage-home-content">
                <Assignstudents/>
            </div>
       </div>
      
    </div>
  );
};

export default Assigndasboardt;