import React from 'react';
import "./PresentationHome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Presentation from '../../components/Presentation/Presentation';




const PresentationHome = () => {
  return (
    <div className='Presentation3'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="presentation-side3">
            <Navbar/>
            </div>
            <div className="content3">
               <Presentation/>
            </div>
       </div>
      
    </div>
  );
};

export default PresentationHome;
