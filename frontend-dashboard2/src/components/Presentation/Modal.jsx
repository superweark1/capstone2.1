// Modal.js
import React from 'react';
import './Modal.css'; // Import CSS for the modal

const Modal = ({ message, onClose }) => {
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

export default Modal;
