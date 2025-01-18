import React, { useState, useEffect } from "react";
import "./Teacher.css";
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

const Teacher = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 7;
  const [teachers, setTeachers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form state
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [teacher_id, setTeacherId] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const [errors, setErrors] = useState({});
  const [expertise, setExpertise] = React.useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/teacher`)
      .then((res) => {
        const sortedTeachers = res.data.sort((a, b) => b.id - a.id); // Sort in descending order by id
        setTeachers(sortedTeachers);
      })
      .catch((err) => {
        console.error("Error fetching teachers:", err);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedTeacher(null);
    setFname("");
    setLname("");
    setTeacherId("");
    setGender("");
    setEmail("");
    setStatus("");
    setExpertise(""); // Reset expertise when closing the modal
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset sa unang page kapag nagsesearch
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      (teacher.fname &&
        teacher.fname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacher.lname &&
        teacher.lname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacher.gender &&
        teacher.gender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacher.email &&
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(teacher.expertise) &&
        teacher.expertise.some((exp) =>
          exp.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
      String(teacher.id).includes(searchQuery)
  );

  // Pagination logic
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fname) newErrors.name = "Name is required";
    if (!lname) newErrors.surname = "Surname is required";
    if (!teacher_id) newErrors.id = "ID is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!email) newErrors.email = "Email is required";
    if (!status) newErrors.status = "Status is required";
    if (!expertise) newErrors.expertise = "Expertise is required"; // Validate expertise
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const url = editMode
      ? `http://localhost:5001/teacher-update/${selectedTeacher.id}`
      : "http://localhost:5001/teacher-create";
    const method = editMode ? "put" : "post";

    const teacherData = {
      fname,
      lname,
      teacher_id,
      gender,
      email,
      status,
      expertise, // Add expertise to the request
    };

    axios[method](url, teacherData)
      .then((res) => {
        console.log("Teacher saved successfully:", res.data);

        // Create the notification message
        let message;
        if (editMode) {
          // Update message
          message = `Teacher ${fname} ${lname}'s information updated.`;
          // Specify which part was updated (if necessary)
          const updatedFields = [];
          if (fname !== selectedTeacher.fname) updatedFields.push("First Name");
          if (lname !== selectedTeacher.lname) updatedFields.push("Last Name");
          if (email !== selectedTeacher.email) updatedFields.push("Email");
          if (status !== selectedTeacher.status) updatedFields.push("Status");
          if (expertise !== selectedTeacher.expertise)
            updatedFields.push("Expertise");

          message +=
            updatedFields.length > 0
              ? ` Updated fields: ${updatedFields.join(", ")}.`
              : "";
        } else {
          // Add message
          message = `New teacher added: ${fname} ${lname}.`;
        }

        // Send the notification with the message
        addNotification(message);

        // Refetch the teachers list to reflect the new addition or update
        axios
          .get("http://localhost:5001/teacher")
          .then((response) => {
            setTeachers(response.data); // Update the teachers with the new data
          })
          .catch((err) => {
            console.error("Error fetching teachers after submission:", err);
          });

        handleClose(); // Close the modal after successful submission
      })
      .catch((err) => {
        console.error("Error saving teacher:", err);
        alert("Failed to save teacher. Please try again.");
      });
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFname(teacher.fname);
    setLname(teacher.lname);
    setTeacherId(teacher.teacher_id);
    setGender(teacher.gender);
    setEmail(teacher.email);
    setStatus(teacher.status);
    setExpertise(teacher.expertise); // Set expertise when editing
    setEditMode(true);
    handleOpen();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      axios
        .delete(`http://localhost:5001/teacher-delete/${id}`)
        .then((res) => {
          console.log("Teacher deleted successfully:", res.data);

          // Refetch the teachers list to reflect the deletion
          axios
            .get("http://localhost:5001/teacher")
            .then((response) => {
              setTeachers(response.data); // Update the teachers with the new data
            })
            .catch((err) => {
              console.error("Error fetching teachers after deletion:", err);
            });
        })
        .catch((err) => {
          console.error("Error deleting teacher:", err);
          alert("Failed to delete teacher. Please try again.");
        });
    }
  };

  const handleStatusChange = (event, id) => {
    const newStatus = event.target.value;

    axios
      .put(`http://localhost:5001/teacher-update/${id}`, {
        status: newStatus,
      })
      .then((res) => {
        console.log("Status updated successfully:", res.data);

        // Update the local teachers list after the status change
        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === id ? { ...teacher, status: newStatus } : teacher
          )
        );
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        alert("Failed to update status. Please try again.");
      });
  };

  const addNotification = (message) => {
    axios
      .post("http://localhost:5001/add-notification", { message })
      .then((response) => console.log("Notification added:", response))
      .catch((error) => console.error("Error adding notification:", error));
  };

  const handleChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    // Limit the number of selections to 3, and "none" clears all
    if (selectedOptions.includes("none")) {
      setExpertise(["none"]);
    } else if (selectedOptions.length <= 3) {
      setExpertise(selectedOptions);
    }
  };

  return (
    <div className="teacher-container">
      <div className="teacher-list">
        <div className="teacher-name">
          <h1>Instructors</h1>
          <div className="teacher-search2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="teacher-search-bar2"
            />
          </div>
          <div className="teacher-button-add2">
            <Button variant="contained" color="primary" onClick={handleOpen}>
              + Add Teacher
            </Button>
          </div>
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="add-teacher-modal"
          aria-describedby="add-teacher-description"
        >
          <Box sx={style}>
            <div className="teacher-input-container">
              <h1 className="add">
                {editMode ? "Edit Teacher" : "Add Teacher"}
              </h1>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Name"
                  name="name"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  label="Surname"
                  name="surname"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.surname}
                  helperText={errors.surname}
                />
                <TextField
                  label="ID"
                  name="id"
                  value={teacher_id}
                  onChange={(e) => setTeacherId(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.id}
                  helperText={errors.id}
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
                  label="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <div className="expertise-container">
                  <label htmlFor="expertise-select">Expertise</label>
                  <select
                    id="expertise-select"
                    className="select-container checkbox-style"
                    multiple
                    value={expertise}
                    onChange={(e) => {
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );

                      // Limit the number of selections to 3, and "none" clears all
                      if (selectedOptions.includes("none")) {
                        setExpertise(["none"]);
                      } else if (selectedOptions.length <= 3) {
                        setExpertise(selectedOptions);
                      }
                    }}
                  >
                    {[
                      "programming",
                      "data-analyst",
                      "cloud-computing",
                      "networking",
                      "cybersecurity",
                      "web-development",
                      "software-development",
                      "image-processing-specialist",
                      "data-science and analytics",
                      "artificial intelligence and machine-learning",
                      "network and systems administration-telecommunications",
                      "mobile application development",
                      "database-administration",
                      "project-management",
                      "user experience ux design",
                      "technical writing and documentation",
                      "technical support",
                      "digital marketing and e-commerce",
                      "it-consulting",
                      "it-auditing and compliance",
                      "software-engineer",
                      "data-mining",
                      "full stack code",
                      "None",
                    ].map((expertiseOption) => (
                      <option key={expertiseOption} value={expertiseOption}>
                        {expertiseOption
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: "1rem" }}
                >
                  {editMode ? "Update Teacher" : "Add Teacher"}
                </Button>
              </form>
            </div>
          </Box>
        </Modal>

        <div className="teacher-table-responsive">
          <table className="teacher-table teacher-table-bordered">
            <thead className="teacher-thead-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Expertise</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.teacher_id}</td>
                  <td>{teacher.fname}</td>
                  <td>{teacher.lname}</td>
                  <td>{teacher.gender}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.expertise}</td> {/* Display expertise */}
                  <td>
                    <div className="select">
                      <Select
                        className="s"
                        value={teacher.status}
                        onChange={(e) => handleStatusChange(e, teacher.id)}
                        fullWidth
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </div>
                  </td>
                  <td>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(teacher)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDelete(teacher.id)}
                      style={{ marginLeft: "1rem" }}
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
            style={{ marginTop: "1rem" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Teacher;
