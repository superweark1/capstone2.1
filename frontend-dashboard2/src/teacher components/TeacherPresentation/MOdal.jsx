// Modal.js
import React from 'react';
import './MOdal.css'; // Import CSS for the modal

const MOdal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <button className="modal-close-button" onClick={onClose}>
          Exit
        </button>
      </div>
    </div>
  );
};

export default MOdal;
