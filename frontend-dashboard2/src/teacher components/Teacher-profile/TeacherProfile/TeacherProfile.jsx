import React, { useState, useEffect, useRef } from 'react';
import './TeacherProfile.css'; // Import CSS for styling
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherProfile = () => {
    const [profile, setProfile] = useState({
        firstname: '',
        lastname: '',
        email: '',
        birthdate: '',
        gender: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
       
        axios.get(`${process.env.REACT_APP_API_URL}/`, { withCredentials: true }) 
            .then(response => {
                const { user } = response.data;
                setProfile(user); 
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login'); 
                }
            });
    }, [navigate]);

    const handleEditProfile = () => {
        navigate('/teacher-EditProfile')
    }
   
    return (
        <div className="TeacherProfile-container" >
           <div className="TeacherProfile-Images">
           <img src="/depositphotos_244284796-stock-illustration-person-gray-photo-placeholder-man.jpg" alt="" />
           </div>

           <div className="TeacherProfile-info">
                <p><strong>Fullname:</strong> {profile.firstname} {profile.lastname}</p>
                <p><strong>Email Address:</strong> {profile.email}</p>
                <p><strong>BirthDate:</strong> {new Date(profile.birthdate).toLocaleDateString()}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <div className="TeacherProfile-page">
                         <button onClick={handleEditProfile}>Edit Profile</button>
             </div>
           </div>

          
        </div>
    );
};

export default TeacherProfile;
