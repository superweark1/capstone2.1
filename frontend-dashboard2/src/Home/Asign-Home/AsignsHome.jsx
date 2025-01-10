import React from 'react';
import "./AsignHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Asign from '../../components/Asign-Page/Asign';




const AsignsHome = () => {
  return (
    <div className='AsignsHomeside-container3'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="AsignsHomeasignavbar-side">
            <Navbar/>
            </div>
            <div className="AsignsHomecontent3">
               <Asign/>
            </div>
       </div>
      
    </div>
  );
};

export default AsignsHome;
