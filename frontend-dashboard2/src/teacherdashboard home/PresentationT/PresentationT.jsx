import React from 'react';
import "./PresentationT.css";


import TeacherPresentation from '../../teacher components/TeacherPresentation/TeacherPresentation';
import Teachersidebar from '../../teacher components/teacher-sidebar/Teachersidebar';
import TeacherNavbar from '../../teacher components/teacher-navbar/TeacherNavbar';




const PresentationT = () => {
  return (
    <div className='PresentationT-container2'>
        <Teachersidebar/>
       <div className="wrapper">
        
            <div className="PresentationTnavbar-side2">
            <TeacherNavbar/>
            </div>
            <div className="PresentationTcontent2">
                <TeacherPresentation/>
            </div>
       </div>
      
    </div>
  );
};

export default PresentationT;
