import React, { useState } from 'react';
import "./RegisterUser.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterUsers = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Simple validation
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            // Connect to the backend registration endpoint
            const response = await axios.post('http://localhost:5001/register', {
                firstname,
                lastname,
                email,
                role,
                birthdate,
                gender,
                password,
            });
            alert(response.data.message); // Show success message

            // Reset form fields after successful submission
            setFirstname('');
            setLastname('');
            setEmail('');
            setRole('');
            setBirthdate('');
            setGender('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            if (error.response && error.response.data) {
                alert(error.response.data.message); // Show error message
            } else {
                alert("Error registering user");
            }
        }
    };

    const handleCancel = () => {
        navigate('/User'); 
    };

    return (
        <div className='register-addUser'>
            <div className="registeruser-container">
                <div className="regitserUser-information">
                    <div className="registerUser-title">
                        <h1>Add User</h1>
                    </div>
                    
                    <div className="registerUser-input">
                        <div className="firstname-lastname">
                            <div className="registerUser-name">
                                <label htmlFor="firstname">Firstname</label>
                                <input 
                                    type="text" 
                                    className='registerUSer-firstname'  
                                    placeholder='Enter firstname' 
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="registerUser-surename">
                                <label htmlFor="lastname">Lastname</label>
                                <input 
                                    type="text" 
                                    className='registerUSer-lastname'  
                                    placeholder='Enter Lastname'  
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                       
                        <div className="email-role">
                            <div className="registerUser-emailAddress">
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    className='registerUSer-email'  
                                    placeholder='Enter email address' 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}  
                                    required
                                />
                            </div>

                            <div className="registerUser-role">
                                <label htmlFor="role">Role</label>
                                <select 
                                    className="registerUser-role-dropdown" 
                                    name="role" 
                                    id="role" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required 
                                >
                                    <option value="" disabled>Select role</option>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="gender-birthdate">
                            <div className="registerUser-birthday">
                                <label htmlFor="date">Birthdate</label>
                                <input 
                                    type="date" 
                                    className='registerUSer-birthdate' 
                                    value={birthdate}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="registerUser-role">
                                <label htmlFor="gender">Gender</label>
                                <select 
                                    className="registerUser-role-dropdown" 
                                    name="gender" 
                                    id="gender" 
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required 
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="password-cpasswod">
                            <div className="registerUser-Userpassword">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    className='registerUSer-password' 
                                    placeholder='Enter your password' 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="registerUser-Usercpasswod">
                                <label htmlFor="confirmPassword">Confirm password</label>
                                <input 
                                    type="password" 
                                    className='registerUSer-Cpassword' 
                                    placeholder='Confirm your password'  
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="registerUser-button">
                            <button type="button" className='sbutton' onClick={handleRegister}>Submit</button>
                            <button type='cancelButton' className='Cancelbutton' onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterUsers;
