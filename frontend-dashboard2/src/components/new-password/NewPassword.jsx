// Modal.js
import React, {useState} from 'react';
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import './NewPassword.css'; // Import CSS for the modal

const NewPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const handleResetPassword = () => {
        if(!newPassword || !confirmPassword){
            setMessage("Please fill in all fields.");
            return;
        }
        if(newPassword !== confirmPassword) {
            setMessage("Password do not match.");
            return;
        }

        axios
        .post(`${process.env.REACT_APP_API_URL}/reset-password` , {
            email,
            password: newPassword,
        })
        .then((response) => {
            if(response.data.success) {
                setMessage("Password reset successfult!");
                navigate("/");
            }else {
                setMessage(response.data.message);
            }
        })
        .catch((error) => {
            console.error("Error resetting password:", error);
            setMessage("An error occured while resetting the password.");
        });     
    };


  return (
    <div className="body-newpassword" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/image/durso.jpg'})` }}>
        <div className="newpassword-container">
            <div className="newpassword-title">
                <h1>New Password</h1>
            </div>
            <div className="newpassword-input">
                <div className="newpassword1-input">
                    <label htmlFor="password">New Password</label>
                    <input type="password" placeholder='Enter your new password' value={newPassword} onChange={handleNewPasswordChange}/>
                </div>
                <div className="confirmnewpassword-input">
                    <label htmlFor="Cpassword">Confirm password</label>
                    <input type="password" placeholder='Confirm your new password' value={confirmPassword} onChange={handleConfirmPasswordChange}/>
                </div>
                <div className="newpassword-button">
                    <button className='button-newpassword' onClick={handleResetPassword}>Send</button>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default NewPassword;
