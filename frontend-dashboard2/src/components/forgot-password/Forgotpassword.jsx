// Modal.js
import React,{useState} from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './Forgotpassword.css'; // Import CSS for the modal


const Forgotpassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();

    const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
    }
    
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSendOTP = () => {
        if(!email){
            setMessage("Please enter your email.");
            return;
        }

        if(!isValidEmail(email)){
            setMessage("Please enter z valid email address.");
            return;
        }

        setLoading(true);
        axios
        .post("http://localhost:5001/send-otp", {email})
        .then((response) => {
            setMessage("Please enter your email.");
            Navigate("/otp", {state: {email}});
        })
        .catch((error) => {
            if(error.response) {
            setMessage(error.response.data);
            } else {
                setMessage("An error occured while sending the OTP.");
            }
        })
        .finally(() => {
            setLoading(false)
        });
    };


  return (
    <div className="body-forgot" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/image/durso.jpg'})` }}>
        <div className="forgot-container">
            <div className="forgot-title">
                <h1>Email Request</h1>
            </div>
            <div className="forgot-input">
                <p className='email-request'>We will sending you a otp code to your email</p>
                <div className="forgotemail-input">
                    <label htmlFor="email">Email</label>
                    <input type="email" placeholder='Enter your email' value={email} onChange={handleEmailChange}/>
                </div>
                <div className="forgot-login">
                    <button className='forgot-button' onClick={handleSendOTP} disabled={loading}>
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>
                {message && <p aria-live="polite">{message}</p>}

            </div>
        </div>
    </div>
  );
};

export default Forgotpassword;
