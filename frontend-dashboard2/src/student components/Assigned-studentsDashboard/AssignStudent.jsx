import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AssignStudent.css";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";

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

const AssignStudent = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const groupsPerPage = 3;

  // State for group form
  const [group_name, setGroupname] = useState("");
  const [selectedStudentNames, setSelectedStudentNames] = useState([]);
  const [research_title, setResearchtitle] = useState("");
  const [adviser, setAdviser] = useState("");
  const [panel_head, setPanelhead] = useState("");
  const [panel_members, setPanelmembers] = useState([]);
  const [grade, setGrade] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [revision_type, setRevisionType] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/student-list`
        );
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/teacher`
        );
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/assign`
        );
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchStudents();
    fetchTeachers();
    fetchGroups();
  }, []);

  const handleOpenAdd = () => setOpenAddModal(true);
  const handleCloseAdd = () => setOpenAddModal(false);

  const handleOpenEdit = () => setOpenEditModal(true);
  const handleCloseEdit = () => setOpenEditModal(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  const filteredGroups = groups.filter((group) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (group.group_name &&
        group.group_name.toLowerCase().includes(searchTerm)) ||
      (group.research_title &&
        group.research_title.toLowerCase().includes(searchTerm)) ||
      (group.student_names &&
        group.student_names.toLowerCase().includes(searchTerm)) ||
      (group.adviser && group.adviser.toLowerCase().includes(searchTerm)) ||
      (group.panel_head &&
        group.panel_head.toLowerCase().includes(searchTerm)) ||
      (group.panel_members &&
        group.panel_members.toLowerCase().includes(searchTerm))
    );
  });

  const handleSubmit = async () => {
    try {
      const formattedNames = (selectedStudentNames || []).join(", ");

      // Ensure panel_members is an array
      const panelMembersArray = Array.isArray(panel_members)
        ? panel_members
        : [];

      const studentEmails = students
        .filter((student) =>
          selectedStudentNames.includes(`${student.fname} ${student.lname}`)
        )
        .map((student) => student.email);

      const adviserEmail =
        teachers.find(
          (teacher) => `${teacher.fname} ${teacher.lname}` === adviser
        )?.email || "";

      const panelheadEmail =
        teachers.find(
          (teacher) => `${teacher.fname} ${teacher.lname}` === panel_head
        )?.email || "";

      const panelmembersEmails = teachers
        .filter((teacher) =>
          panelMembersArray.includes(`${teacher.fname} ${teacher.lname}`)
        )
        .map((teacher) => teacher.email);

      const newGroup = {
        group_name,
        name: formattedNames,
        research_title,
        adviser,
        panel_head,
        panel_members: panelMembersArray,
        adviser_email: adviserEmail,
        panelhead_email: panelheadEmail,
        panelmembers_email: panelmembersEmails,
        student_emails: studentEmails,
        grade,
        recommendation,
        revision_type,
      };

      if (editingId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/update-group/${editingId}`,
          newGroup
        );
        alert("Group updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/create-group`,
          newGroup
        );
        alert("Group added successfully!");
      }

      handleCloseAdd();
    } catch (error) {
      console.error(
        "Error submitting group:",
        error.response?.data || error.message
      );
      alert(
        `Failed to submit group. Status: ${error.response?.status}, Message: ${error.response?.data}`
      );
    }
  };

  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredGroups.slice(
    indexOfFirstGroup,
    indexOfLastGroup
  );
  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/delete-assign/${id}`
      );
      setGroups(groups.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  // Function to extract keywords from the research title
  const extractKeywordsFromTitle = (title) => {
    // Split the title into words without changing the case
    const words = title.split(/[\s,]+/);
    return words.filter((word) => word.length > 1); // Filtering out very short words
  };

  // Function to check if the teacher's expertise matches any keywords from the title
  const isExpertiseApplicable = (expertise, titleKeywords) => {
    // Normalize expertise to lower case for comparison
    const lowerCaseExpertise = expertise.toLowerCase();
    return titleKeywords.some((keyword) =>
      lowerCaseExpertise.includes(keyword.toLowerCase())
    );
  };

  const handleResearchTitleChange = (e) => {
    const title = e.target.value;
    setResearchtitle(title);
    suggestPanelBasedOnExpertise(title);
  };

  const suggestPanelBasedOnExpertise = (title) => {
    if (!title) return;

    // Keywords extracted from research title for matching
    const keywords = title.split(" "); // Simple keyword extraction

    // Filter teachers based on expertise match
    const matchedTeachers = teachers.filter((teacher) => {
      // Ensure expertise is an array; if not, convert from comma-separated string
      const expertiseArray = Array.isArray(teacher.expertise)
        ? teacher.expertise
        : teacher.expertise.split(",").map((item) => item.trim());

      // Check if any expertise item matches any keyword
      return expertiseArray.some((expertise) =>
        keywords.some((keyword) =>
          expertise.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });

    // Assign the first matched teacher as panel head and others as members
    if (matchedTeachers.length > 0) {
      setPanelhead(`${matchedTeachers[0].fname} ${matchedTeachers[0].lname}`);
      setPanelmembers(
        matchedTeachers
          .slice(1)
          .map((teacher) => `${teacher.fname} ${teacher.lname}`)
      );
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) => `${teacher.fname} ${teacher.lname}` !== adviser
  );

  const addNotification = (message) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/add-notification`, { message })
      .then((response) => console.log("Notification added:", response))
      .catch((error) => console.error("Error adding notification:", error));
  };

  // Example of usage:
  const handleAddAsign = () => {
    // Add logic for adding an item here
    addNotification("New assignment added!");
  };

  return (
    <div className="AssignStudent-assign-container">
      <div className="AssignStudent-assign-list1">
        <div className="AssignStudent-assign-name">
          <h1>Assign</h1>
          <div className="AssignStudent-controls-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="AssignStudent-assign-search-bar1"
            />
          </div>
        </div>
        <div className="AssignStudent-table-responsive">
          <table className="AssignStudent-assign-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Student Names</th>
                <th>Research Title</th>
                <th>Adviser</th>
                <th>Panel Head</th>
                <th>Panel Members</th>
              </tr>
            </thead>
            <tbody>
              {currentGroups.map((group) => (
                <tr key={group.id}>
                  <td>{group.group_name}</td>
                  <td>{group.name}</td>
                  <td>{group.research_title}</td>
                  <td>{group.adviser}</td>
                  <td>{group.panel_head}</td>
                  <td>{group.panel_members}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            className="AssignStudent-pagination"
          />
        </div>
      </div>
    </div>
  );
};

export default AssignStudent;
