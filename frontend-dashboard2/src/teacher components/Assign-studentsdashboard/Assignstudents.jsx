import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Assignstudents.css";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const Assignstudents = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false); // State for the edit modal
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 3;

  // State for group form
  const [group_name, setGroupname] = useState('');
  const [selectedStudentNames, setSelectedStudentNames] = useState([]);
  const [name, setName] = useState([]);
  const [research_title, setResearchtitle] = useState('');
  const [adviser, setAdviser] = useState('');
  const [panel_head, setPanelhead] = useState('');
  const [panel_members, setPanelmembers] = useState();
  const [grade, setGrade] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [suggestedPanelHeads, setSuggestedPanelHeads] = useState([]);
  const [selectedPanelMembers, setSelectedPanelMembers] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5001/students');
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    const fetchTeachers = async () => {
      try {
          const response = await axios.get('http://localhost:5001/teacher');
          setTeachers(response.data);
      } catch (error) {
          console.error("Error fetching teachers:", error);
      }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5001/assign');
      const sortedGroups = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order
      setGroups(sortedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

    fetchStudents();
    fetchTeachers();
    fetchGroups();
  }, []);

  const suggestPanelHeads = (title) => {
    if (!title) {
        setSuggestedPanelHeads([]);
        return;
    }

    const keywords = title.toLowerCase().split(" ");
    const suggestions = teachers.filter(teacher =>
        teacher.expertise.some(exp => 
            keywords.some(keyword => exp.toLowerCase().includes(keyword))
        )
    );

    setSuggestedPanelHeads(suggestions);
};


  const handleOpenAdd = () => setOpenAddModal(true);
  const handleCloseAdd = () => setOpenAddModal(false);
  
  const handleOpenEdit = () => setOpenEditModal(true);
  const handleCloseEdit = () => setOpenEditModal(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleResearchTitleChange = (event) => {
    const title = event.target.value;
    setResearchtitle(title);
    suggestPanelHeads(title);
  };


  const handleSubmit = async () => {
    try {
      const formattedNames = (selectedStudentNames || []).join(', ');

      const newGroup = {
        group_name,
        name: formattedNames,
        research_title,
        adviser,
        panel_head,
        panel_members,
        grade
      };

      if (editingId) {
        await axios.put(`http://localhost:5001/update-group/${editingId}`, newGroup);
        alert('Group updated successfully!');
      } else {
        await axios.post('http://localhost:5001/create-group', newGroup);
        alert('Group added successfully!');
      }

    } catch (error) {
      console.error('Error submitting group:', error.response?.data || error.message);
      alert(`Failed to submit group. Status: ${error.response?.status}, Message: ${error.response?.data}`);
    }
  };

  const filteredGroups = groups.filter((group) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (group.group_name && group.group_name.toLowerCase().includes(searchTerm)) ||
      (group.research_title && group.research_title.toLowerCase().includes(searchTerm))
    );
  });

  const indexOfLastGroup = currentPage * studentsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - studentsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);
  const totalPages = Math.ceil(filteredGroups.length / studentsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/delete-assign/${id}`);
      setGroups(groups.filter((item) => item.id !== id)); // Update 'groups' state
    } catch (err) {
      console.error("Error deleting assignment:", err); // Log the actual error
    }
  };

  const handleStudentChange = (event) => {
    const value = event.target.value;
    setSelectedStudentNames((prev) => 
      prev.includes(value) ? prev.filter(name => name !== value) : [...prev, value]
    );
  };
  
  const handlePanelMemberChange = (event) => {
    const value = event.target.value;
    setSelectedPanelMembers((prev) => 
      prev.includes(value) ? prev.filter(name => name !== value) : [...prev, value]
    );
  };

  return (
    <div className='AssignStudents'>
      <div className="AssignStudents1">
        <div className="assigns-name">
          <h1>Assign</h1>
          <div className="controls-container">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={handleSearchChange} 
              className="assigns-search-bar2"
            />
          
          </div>
        </div>
        <div className="tables-responsive1">
          <table className="assigns-table">
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
            className="pagination" 
          />
        </div>
      </div>
    </div>
  );
};

export default Assignstudents;
