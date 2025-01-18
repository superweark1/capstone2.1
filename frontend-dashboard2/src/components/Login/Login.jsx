import React, { useState } from 'react';
import './Login.css'; // Import CSS for the modal
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate(); // Create a navigate function

    // Correcting withCredentials typo
    axios.defaults.withCredentials = true;

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, values);
            if (response.data) {
                alert("Login successful");

                // Setting the token in localStorage
                localStorage.setItem("token", response.data.token);

                 // Navigating based on user role
            const role = response.data.role.toLowerCase(); // Ensure role is lowercase
            if (role === "admin") {
                console.log("Admin successfully logged in.");
                navigate('/dashboard'); 
            } else if (role === "student") {
                console.log("Student successfully logged in.");
                navigate('/student-Dashboard'); 
            } else if (role === "teacher") {
                console.log("Teacher successfully logged in.");
                navigate('/teacher-Dashboard'); 
            } else {
                alert("Unknown role."); // Alert for unknown role
                navigate('/'); 
            }
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = error.response?.data?.Message || "An error occurred during login.";
            alert(errorMessage);
        }
    };

    // Handle navigation for forgot password
    const handleForgotPassword = () => {
        navigate('/email-request'); // Replace '/forgot-password' with your actual route
    };

    return (
        <div className="body-login" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/image/durso.jpg'})` }}>
            <div className="login-container">
                <div className="login-title">
                    <h1>LOGIN</h1>
                </div>
                <div className="login-input">
                    <div className="email-input">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="password-input">
                        <label htmlFor="Password">Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="forgot">
                        <p onClick={handleForgotPassword}>Forgot Password</p>
                    </div>
                    <div className="button-login">
                        <button className="login-button" onClick={handleLogin}>LOGIN</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
