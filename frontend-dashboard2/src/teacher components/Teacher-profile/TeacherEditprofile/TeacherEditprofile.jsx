import React, { useState, useEffect } from "react";
import "./TeacherEditprofile.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TeacherEditprofile = () => {
  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    birthdate: "",
    gender: "",
  });

  const navigate = useNavigate();

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/`, {
          withCredentials: true, // Include cookies in the request
        });

        const { user } = response.data;
        setProfileData({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          birthdate: user.birthdate,
          gender: user.gender,
        });
      } catch (error) {
        console.error("There was an error fetching the profile data!", error);
      }
    };

    fetchProfileData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update profile data
      await axios.put(
        `${process.env.REACT_APP_API_URL}/updateprofile`,
        profileData,
        {
          withCredentials: true, // Include cookies in the request
        }
      );
      alert("Profile updated successfully!");
      navigate("/teacher-Profile"); // Redirect to profile page after successful update
    } catch (error) {
      console.error("There was an error updating the profile!", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="EditProfile-container">
      <div className="edit-profileimg">
        <img
          src="/depositphotos_244284796-stock-illustration-person-gray-photo-placeholder-man.jpg"
          alt=""
        />
      </div>

      <form className="editInput-txt" onSubmit={handleSubmit}>
        <div className="editInput">
          <label htmlFor="firstname">Firstname</label>
          <input
            type="text"
            name="firstname"
            value={profileData.firstname}
            onChange={(e) =>
              setProfileData((prevData) => ({
                ...prevData,
                firstname: e.target.value,
              }))
            }
          />
        </div>
        <div className="editInput">
          <label htmlFor="lastname">Lastname</label>
          <input
            type="text"
            name="lastname"
            value={profileData.lastname}
            onChange={(e) =>
              setProfileData((prevData) => ({
                ...prevData,
                lastname: e.target.value,
              }))
            }
          />
        </div>
        <div className="editInput">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData((prevData) => ({
                ...prevData,
                email: e.target.value,
              }))
            }
          />
        </div>
        <div className="editInput">
          <label htmlFor="birthdate">Birthdate</label>
          <input
            type="date"
            name="birthdate"
            value={profileData.birthdate}
            onChange={(e) =>
              setProfileData((prevData) => ({
                ...prevData,
                birthdate: e.target.value,
              }))
            }
          />
        </div>
        <div className="editInput">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={profileData.gender}
            onChange={(e) =>
              setProfileData((prevData) => ({
                ...prevData,
                gender: e.target.value,
              }))
            }
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="edit-buttom">
          <div className="submitbutton-profile">
            <button type="submit">Submit</button>
          </div>
          <div className="cancelbutton-profile">
            <button type="button" onClick={() => navigate("/teacher-Profile")}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeacherEditprofile;
