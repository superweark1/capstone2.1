import React from 'react';
import "./Studentuserhome.css";
import StudentSidebar from '../../student components/student sidebar/StudentSidebar';
import StudentNavbar from '../../student components/student navbar/StudentNavbar';
import StudentDashboard from '../../student components/Student-Dashboard/StudentDashboard';





const Studentuserhome = () => {
  return (
    <div className='studentuser-home-side-container'>
        <StudentSidebar/>
       <div className="wrapper">
        
            <div className="Studentuserhome">
            <StudentNavbar/>
            </div>
            <div className="studentuser-home-content">
                <StudentDashboard/>
            </div>
       </div>
      
    </div>
  );
};

export default Studentuserhome;