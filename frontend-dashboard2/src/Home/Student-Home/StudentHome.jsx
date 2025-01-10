import React from 'react';
import "./StudentHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Student from '../../components/Student-Page/Student';




const StudentHome = () => {
  return (
    <div className='StudentHomeside-container1'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="StudentHomenavbar-side1">
            <Navbar/>
            </div>
            <div className="StudentHomecontent1">
                <Student/>
            </div>
       </div>
      
    </div>
  );
};

export default StudentHome;
