import React from 'react';
import "./ResearchHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Research from '../../components/Research/Research';




const ResearchHome = () => {
  return (
    <div className='ResearcHomeresearch2'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="ResearcHomenavbar-side2">
            <Navbar/>
            </div>
            <div className="ResearcHomecontent2">
                <Research/>
            </div>
       </div>
      
    </div>
  );
};

export default ResearchHome;
