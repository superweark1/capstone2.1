import React, { useState, useEffect, useRef } from 'react';
import './Otp.css'; // Import CSS for styling
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Otp = () => {
   const location = useLocation();
   const email = location.state?.email;
   const navigate = useNavigate();

   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
   const [timer, setTimer] = useState(60);
   const [canResend, setCanResend] = useState(false);
   const [verificationMessage, setVerificationMessage] = useState("");

   const inputRefs = useRef([]);

   useEffect(() => {
    if (timer > 0) {
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    } else {
        setCanResend(true);
    }
   }, [timer]);

   const handleChange = (e, index) => {
    const value = e.target.value;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);

    setOtp(newOtp);

    // Move focus to the next input field
    if (value && index < newOtp.length - 1) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) nextInput.focus();
    }
   };

   const handleBackspace = (e, index) => {
    // Move focus to the previous input field on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) prevInput.focus();
    }
   };

   const handleResendOTP = () => {
    setTimer(60);
    setCanResend(false);

    axios
    .post("http://localhost:5001/send-otp", { email })
    .then((response) => {
        console.log("Response from resend OTP:", response.data);
        setVerificationMessage("OTP has been resent to your email.");
    })
    .catch((error) => {
        console.error("Error resending OTP:", error);
        setVerificationMessage("Error resending OTP.");
    });
   };

   const handleVerifyOTP = () => {
    const otpCode = otp.join("");  // Join the OTP digits

    axios
    .post("http://localhost:5001/verify-otp", {email, otp: otpCode})  // Send email and otpCode correctly
    .then((response) => {
        if(response.data.success) {
            setVerificationMessage("OTP verified successfully!");
            navigate("/new-password", {state: {email}});
        } else {
            setVerificationMessage("Invalid OTP. Please try again.");
            setOtp(["", "", "", "", "", ""]);  // Clear OTP input
        }
    })
    .catch((error) => {
        setVerificationMessage("An error occurred while verifying OTP.");
    });
};


    return (
        <div className="body-otp" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/image/durso.jpg'})` }}>
            <div className="otpcontainer-home">
                <div className="otp-container">
                    <div className="otp-title">
                        <h1>Email Verification</h1>
                    </div>

                    <div className="message-otp">
                        {email && (
                             <p className='otp-send'>OTP has been sent to: <span className='email-tag'>{email}</span></p>
                        )}
                    </div>

                    {verificationMessage && <p className="otp-message">{verificationMessage}</p>}
                    <div className="otp-input">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                ref={(el) => (inputRefs.current[index] = el)} // Set ref to manage input focus
                                name={`otp${index}`}
                                value={otp[index]}  // Set the value to display the current OTP digit
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleBackspace(e, index)}
                                className="otp-input"
                                inputMode='numeric'
                            />
                        ))}
                    </div>

                    <div className="otp-button">
                        <button onClick={handleVerifyOTP}>Verify account</button>
                    </div>

                    <div className="otp-timer">
                        {canResend ? (
                            <button onClick={handleResendOTP}>Resend OTP</button>
                        ) : (
                            <p className='timer-otp'>Resend OTP in {timer} seconds</p>
                        )}
                    </div>

                  
                </div>
            </div>
        </div>
    );
};

export default Otp;
