import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegisterHome.css';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import { useNavigate } from 'react-router-dom';

const RegisterHome = () => {
  const [students, setStudents] = useState([]); // All students fetched from API
  const [searchQuery, setSearchQuery] = useState(''); // Search bar state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const studentsPerPage = 5; // Students to display per page
  const navigate = useNavigate();

  // Fetch students from the backend when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5001/studentsDashboard')
      .then(response => {
        console.log(response.data); // Log the data for debugging
        setStudents(response.data); // Set the fetched data to state
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  }, []);

  // Function to delete a student
  const deleteStudent = (id) => {
    axios.delete(`http://localhost:5001/studentsDelete/${id}`)
      .then(() => {
        setStudents(prevStudents => prevStudents.filter(student => student.id !== id));
      })
      .catch(error => {
        console.error('Error deleting student:', error);
      });
  };

  // Search bar change handler
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when search query changes
  };

  // Pagination change handler
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    (student.firstname && student.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.lastname && student.lastname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate the range of students to show on the current page
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Handle navigation to user registration form
  const handleSubmit = () => {
    navigate('/User/register-user');
  };

  return (
    <div className='registerhome-container'>
      <div className="registerhome-list">
        <div className="registerhome-name">
          <h1>Users</h1>
          <div className="search">
            <input 
              type="text" 
              placeholder="Search user" 
              value={searchQuery} 
              onChange={handleSearchChange} 
              className="registerhome-search-bar1"
            />
          </div>
          <div className="registerhome-button-add1">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              + Add User
            </Button>
          </div>
        </div>

        {/* Student table */}
        <div className="registerhome-table">
          <table className='table1'>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Birthdate</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="7">No students found</td>
                </tr>
              ) : (
                currentStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.firstname}</td>
                    <td>{student.lastname}</td>
                    <td>{student.gender}</td>
                    <td>{student.email}</td>
                    <td>{student.birthdate}</td>
                    <td>{student.role}</td>
                    <td>
                      <div className="registerUser-delete">
                        <button onClick={() => deleteStudent(student.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination className='pagination-register'
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default RegisterHome;
