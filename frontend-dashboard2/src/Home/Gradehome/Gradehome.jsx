import React from 'react';
import "./Gradehome.css";
import Sidebar from '../../navbar-sidebar/sidebar/Sidebar';
import Navbar from '../../navbar-sidebar/navbar/Navbar';
import Grade from '../../components/grade/Grade';




const Gradehome = () => {
  return (
    <div className='gradehome3'>
        <Sidebar/>
       <div className="wrapper">
        
            <div className="gradehome-side3">
            <Navbar/>
            </div>
            <div className="gradehomecontent3">
               <Grade/>
            </div>
       </div>
      
    </div>
  );
};

export default Gradehome;
