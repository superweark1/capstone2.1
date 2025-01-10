import React from 'react';
import "./TeacherHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Student from '../../components/Student-Page/Student';
import Teacher from '../../components/Teacher-Page/Teacher';




const TeachersHome = () => {
  return (
    <div className='TeachersHomeside-container2'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="TeachersHomenavbar-side2">
            <Navbar/>
            </div>
            <div className="TeachersHomecontent2">
                <Teacher/>
            </div>
       </div>
      
    </div>
  );
};

export default TeachersHome;
