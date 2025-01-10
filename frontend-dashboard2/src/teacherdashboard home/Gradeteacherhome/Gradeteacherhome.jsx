import React from 'react';
import "./Gradeteacherhome.css";
import Teachersidebar from '../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../teacher components/teacher-navbar/TeacherNavbar';
import Gradeteacher from '../../teacher components/Gradeteacher/Gradeteacher';





const Gradeteacherhome = () => {
  return (
    <div className='Gradeteacherhomeside-container'>
        <Teachersidebar/>
       <div className="wrapper">
        
            <div className="navbar-Gradeteacherhome">
            <TeacherNavbar/>
            </div>
            <div className="Gradeteacherhome-content">
                <Gradeteacher/>
            </div>
       </div>
      
    </div>
  );
};

export default Gradeteacherhome;