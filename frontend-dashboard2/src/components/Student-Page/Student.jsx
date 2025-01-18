import React, { useState, useEffect } from "react";
import "./Student.css";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const Student = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;
  const [students, setStudents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [student_id, setStudentId] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [gender, setGender] = useState("");
  const [year_level, setYearLevel] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/student-list`)
      .then((res) => {
        const sortedStudents = res.data.sort((a, b) => b.id - a.id); // Sort in descending order by id
        setStudents(res.data);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedStudent(null);
    setStudentId("");
    setFname("");
    setLname("");
    setGender("");
    setYearLevel("");
    setEmail("");
    setStatus("");
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  // Filter students based on the search query
  const filteredStudents = students.filter(
    (student) =>
      (student.student_id &&
        String(student.student_id).includes(searchQuery)) ||
      (student.fname &&
        student.fname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.lname &&
        student.lname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.gender &&
        student.gender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.year_level &&
        student.year_level.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.email &&
        student.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.status &&
        student.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fname) newErrors.fname = "First name is required";
    if (!lname) newErrors.lname = "Last name is required";
    if (!student_id) newErrors.student_id = "Student ID is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!year_level) newErrors.year_level = "Year level is required";
    if (!email) newErrors.email = "Email is required";
    if (!status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const url = editMode
      ? `${process.env.REACT_APP_API_URL}/student-update/${selectedStudent.id}`
      : `${process.env.REACT_APP_API_URL}/student-create`;
    const method = editMode ? "put" : "post";

    const studentData = {
      student_id,
      fname,
      lname,
      gender,
      year_level,
      email,
      status,
    };

    axios[method](url, studentData)
      .then((res) => {
        console.log("Student saved successfully:", res.data);

        // Create the notification message
        let message;
        if (editMode) {
          // Update message
          message = `Student ${fname} ${lname}'s information updated.`;
          // Specify which part was updated (if necessary)
          const updatedFields = [];
          if (fname !== selectedStudent.fname) updatedFields.push("First Name");
          if (lname !== selectedStudent.lname) updatedFields.push("Last Name");
          if (email !== selectedStudent.email) updatedFields.push("Email");
          if (status !== selectedStudent.status) updatedFields.push("Status");

          message +=
            updatedFields.length > 0
              ? ` Updated fields: ${updatedFields.join(", ")}.`
              : "";
        } else {
          // Add message
          message = `New student added: ${fname} ${lname}.`;
        }

        // Send the notification with the message
        addNotification(message);

        // Refetch the students list to reflect the new addition or update
        axios
          .get(`${process.env.REACT_APP_API_URL}/student-list`)
          .then((response) => {
            setStudents(response.data); // Update the students with the new data
          })
          .catch((err) => {
            console.error("Error fetching students after submission:", err);
          });

        handleClose(); // Close the modal after successful submission
      })
      .catch((err) => {
        console.error("Error saving student:", err);
        alert("Failed to save student. Please try again.");
      });
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setStudentId(student.student_id);
    setFname(student.fname);
    setLname(student.lname);
    setGender(student.gender);
    setYearLevel(student.year_level);
    setEmail(student.email);
    setStatus(student.status);
    setEditMode(true);
    handleOpen();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      axios
        .delete(`http://localhost:5001/student-delete/${id}`)
        .then((res) => {
          console.log("Student deleted successfully:", res.data);

          // Refetch the students list to reflect the deletion
          axios
            .get("http://localhost:5001/student-list")
            .then((response) => {
              setStudents(response.data); // Update the students with the new data
            })
            .catch((err) => {
              console.error("Error fetching students after deletion:", err);
            });
        })
        .catch((err) => {
          console.error("Error deleting student:", err);
          alert("Failed to delete student. Please try again.");
        });
    }
  };

  const addNotification = (message) => {
    axios
      .post("http://localhost:5001/add-notification", { message })
      .then((response) => console.log("Notification added:", response))
      .catch((error) => console.error("Error adding notification:", error));
  };

  return (
    <div className="students-container">
      <div className="students-list">
        <div className="students-name">
          <h1>Student</h1>
          <div className="students-search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="students-search-bar"
            />
          </div>
          <div className="students-button-add">
            <Button variant="contained" color="primary" onClick={handleOpen}>
              + Add Student
            </Button>
          </div>
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="add-student-modal"
          aria-describedby="add-student-description"
        >
          <Box sx={style}>
            <div className="students-input-container">
              <h1>{editMode ? "Edit Student" : "Add Student"}</h1>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="First Name"
                  name="fname"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.fname}
                  helperText={errors.fname}
                />
                <TextField
                  label="Last Name"
                  name="lname"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.lname}
                  helperText={errors.lname}
                />
                <TextField
                  label="Student ID"
                  name="student_id"
                  value={student_id}
                  onChange={(e) => setStudentId(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.student_id}
                  helperText={errors.student_id}
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.gender}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
                {errors.gender && <p className="error">{errors.gender}</p>}

                <TextField
                  label="Year Level"
                  name="year_level"
                  value={year_level}
                  onChange={(e) => setYearLevel(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.year_level}
                  helperText={errors.year_level}
                />
                <TextField
                  label="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <Select
                  label="Status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.status}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Status</em>
                  </MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
                {errors.status && <p className="error">{errors.status}</p>}

                <div className="modal-buttons">
                  <Button type="submit" variant="contained" color="primary">
                    {editMode ? "Update Student" : "Add Student"}
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Box>
        </Modal>

        <div className="students-list-table">
          <table className="tables">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Year Level</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>
                    {student.fname} {student.lname}
                  </td>
                  <td>{student.gender}</td>
                  <td>{student.year_level}</td>
                  <td>{student.email}</td>
                  <td>{student.status}</td>
                  <td>
                    <Button
                      onClick={() => handleEdit(student)}
                      variant="outlined"
                      color="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(student.id)}
                      variant="outlined"
                      color="secondary"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      </div>
    </div>
  );
};

export default Student;
