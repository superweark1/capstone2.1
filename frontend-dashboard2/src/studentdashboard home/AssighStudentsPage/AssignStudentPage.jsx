import React from 'react';
import "./AssignStudentPage.css";
import StudentSidebar from '../../student components/student sidebar/StudentSidebar';
import StudentNavbar from '../../student components/student navbar/StudentNavbar';
import AssignStudent from '../../student components/Assigned-studentsDashboard/AssignStudent';





const AssignStudentPage = () => {
  return (
    <div className='AssignStudentPage-home-side-container'>
        <StudentSidebar/>
       <div className="wrapper">
        
            <div className="navbar-AssignStudentPage">
            <StudentNavbar/>
            </div>
            <div className="AssignStudentPage-home-content">
                <AssignStudent/>
            </div>
       </div>
      
    </div>
  );
};

export default AssignStudentPage;