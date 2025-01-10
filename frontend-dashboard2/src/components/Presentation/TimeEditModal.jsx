import React, { useState } from "react";

const TimeEditModal = ({ currentTimeLimit, onSave, onClose }) => {
  const [newTimeLimit, setNewTimeLimit] = useState(currentTimeLimit);

  const handleSave = () => {
    onSave(newTimeLimit);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Time Limit</h2>
        <label>Time Limit (HH:MM:SS):</label>
        <input
          type="text"
          value={newTimeLimit}
          onChange={(e) => setNewTimeLimit(e.target.value)}
          placeholder="00:00:00"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TimeEditModal;
