import React, { useState, useEffect } from 'react';
import './TeacherNavbar.css';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { IoIosLogOut } from 'react-icons/io';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';

const TeacherNavbar = () => {
  const [users, setUser] = useState({
    firstname: "",
    lastname: "",
    email: ""
  });
  const [loading, setLoading] = useState(true); // Loading state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchUserData = () => {
    axios
      .get('http://localhost:5001/', { withCredentials: true }) // Sending credentials (cookies)
      .then((response) => {
        console.log('User data:', response.data);
        if (response.status === 200 && response.data.message === 'Profile retrieved successfully') {
          setUser({
            firstname: response.data.user.firstname || "",
            lastname: response.data.user.lastname || "",
            email: response.data.user.email || ""
          });
        } else {
          alert('Failed to fetch user data');
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error fetching user data:', error.response.data);
          alert(`Error: ${error.response.data.message || 'An error occurred'}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          alert('No response received from the server. Please try again.');
        } else {
          console.error('Error:', error.message);
          alert('An error occurred while fetching user data.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Run this effect once on component mount

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Opens the menu
  };

  const handleClose = () => {
    setAnchorEl(null); // Closes the menu
  };
  const navigate = useNavigate();

  const hanleMyprofile = () => {
    navigate('/teacher-Profile')
  }

  const handleLogout = () => {
    axios
      .post('http://localhost:5001/logout', {}, { withCredentials: true }) // Assuming you have a logout route
      .then((response) => {
        if (response.status === 200) {
          console.log('Logged out successfully');
          navigate('/'); 
        } else {
          alert('Failed to log out');
        }
      })
      .catch((error) => {
        console.error('Error during logout:', error);
        alert('An error occurred during logout.');
      });
  };


useEffect(() => {
  fetchNotifications();
}, []);

const fetchNotifications = () => {
  axios.get('http://localhost:5001/get-notifications')
    .then(response => {
      setNotifications(response.data.notifications);
      setUnreadNotificationsCount(response.data.notifications.length); // I-set ang bilang ng unread
    })
    .catch(error => console.error("Error fetching notifications:", error));
};

const [notificationAnchor, setNotificationAnchor] = useState(null);
const handleNotificationClick = (event) => {
  setNotificationAnchor(event.currentTarget);
  setUnreadNotificationsCount(0); // I-reset ang unread count kapag na-click ang icon
};
const handleNotificationClose = () => {
  setNotificationAnchor(null);
};

const openNotifications = Boolean(notificationAnchor);

const removeNotification = (index) => {
  const notificationId = notifications[index].id; // Assuming the notification has an 'id' field

  // Mark the notification as read on the backend
  axios.put(`http://localhost:5001/mark-notification-read/${notificationId}`)
    .then(response => {
      console.log('Notification marked as read:', response.data.message);

      // After successfully marking as read, remove it from the local state
      setNotifications((prevNotifications) => {
        const updatedNotifications = [...prevNotifications];
        updatedNotifications.splice(index, 1); // Remove the clicked notification
        return updatedNotifications;
      });

      // Update unread notification count based on the backend response
      setUnreadNotificationsCount(response.data.unreadCount); // Update the count
    })
    .catch(error => {
      console.error('Error marking notification as read:', error);
    });
};

useEffect(() => {
  // Fetch the unread notification count when the page loads
  axios.get('http://localhost:5001/unread-notification-count')
    .then(response => {
      setUnreadNotificationsCount(response.data.unreadCount); // Set the unread count from the server
    })
    .catch(error => {
      console.error('Error fetching unread notification count:', error);
    });
}, []);



  return (
    <div className="teacher-nav-container">
       
      <button className="teacher-myAccountWrapper" id="myAccountWrapper" onClick={handleClick}>
        <div className="teacher-myAcc">
          <div className="teacher-userImg">
            <span className="teacher-rounded-circle">
              <img src="/depositphotos_244284796-stock-illustration-person-gray-photo-placeholder-man.jpg" alt="Profile" />
            </span>
          </div>
          <div className="teacher-userInfo">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <h4>{`${users.firstname} ${users.lastname}`}</h4>
                <p className="teacher-gmail-info">{users.email}</p>
              </>
            )}
          </div>
        </div>
        
      </button>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        className="teacher-account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={hanleMyprofile} className="teacher-icon-profile">
          <MdOutlineAccountCircle className="teacher-profile" /> My account
        </MenuItem>
        <MenuItem onClick={handleClose} className="teacher-logout">
          <ListItemIcon>
            <IoIosLogOut className="teacher-icon-logout" />
          </ListItemIcon>
          <span onClick={handleLogout}>Logout</span>
        </MenuItem>
      </Menu>
      <div className="teacher-nicons">
      <div className="teacher-notificationIcons">
            <Badge badgeContent={unreadNotificationsCount} color="secondary">
        <NotificationsIcon onClick={handleNotificationClick} />
      </Badge>
            <Popover
        open={openNotifications}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="teacher-notification-popover"  // Add this custom class
      >
        {/* Content inside Popover */}
        <div className="teacher-notification-menu">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={() => removeNotification(index)}>
              {notification.message}
            </MenuItem>
          ))
        ) : (
          <MenuItem>No notifications</MenuItem>
        )}
      </div>
      </Popover>
  </div>
    </div>
      <div className="teacher-icon-images">
     
            <div className="teacher-logo1">
              <img src="/image/ITcourselogo-removebg-preview.png" alt="" />
            </div>
            <div className="teacher-logo2">
            <img src="/image/aceslogo.png" alt="" />
            </div>
            <div className="teacher-logo3">
            <img src="/image/durso-removebg-preview.png" alt="" />
            </div>
      </div>
    </div>
  );
};

export default TeacherNavbar;
