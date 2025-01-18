import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Asign.css";
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

const Asign = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;

  // State for group form
  const [group_name, setGroupname] = useState('');
  const [selectedStudentNames, setSelectedStudentNames] = useState([]);
  const [research_title, setResearchtitle] = useState('');
  const [adviser, setAdviser] = useState('');
  const [panel_head, setPanelhead] = useState('');
  const [panel_members, setPanelmembers] = useState([]);
  const [grade, setGrade] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [revision_type, setRevisionType] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/student-list`);
        const sortedGroups = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/teacher`);
        setTeachers(response.data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/assign`);
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
      (group.group_name && group.group_name.toLowerCase().includes(searchTerm)) ||
      (group.research_title && group.research_title.toLowerCase().includes(searchTerm)) ||
      (group.name && group.name.toLowerCase().includes(searchTerm)) ||
      (group.adviser && group.adviser.toLowerCase().includes(searchTerm)) ||
      (group.panel_head && group.panel_head.toLowerCase().includes(searchTerm)) ||
      (group.panel_members && group.panel_members.toLowerCase().includes(searchTerm))
    );
  });
  
  const handleSubmit = async () => {
    try {
      const formattedNames = (selectedStudentNames || []).join(', ');
  
      // Ensure panel_members is a string with names joined by commas without array symbols or quotes
      const panelMembersString = Array.isArray(panel_members)
        ? panel_members.slice(0, 2).join(', ') // Limit to 2 panel members
        : '';
  
      const studentEmails = students
        .filter(student => selectedStudentNames.includes(`${student.fname} ${student.lname}`))
        .map(student => student.email);
  
      const adviserEmail = teachers
        .find(teacher => `${teacher.fname} ${teacher.lname}` === adviser)?.email || '';
  
      const panelheadEmail = teachers
        .find(teacher => `${teacher.fname} ${teacher.lname}` === panel_head)?.email || '';
  
      const panelmembersEmails = teachers
        .filter(teacher => panelMembersString.includes(`${teacher.fname} ${teacher.lname}`))
        .map(teacher => teacher.email);
  
      const newGroup = {
        group_name,
        name: formattedNames,
        research_title,
        adviser,
        panel_head,
        panel_members: panelMembersString, // Use the formatted string
        adviser_email: adviserEmail,
        panelhead_email: panelheadEmail,
        panelmembers_email: panelmembersEmails,
        student_emails: studentEmails,
      };
  
      if (editingId) {
        await axios.put(`http://localhost:5001/update-group/${editingId}`, newGroup);
        addNotification(`Group "${group_name}" updated successfully!`);
        alert('Group updated successfully!');
      } else {
        await axios.post('http://localhost:5001/create-group', newGroup);
        addNotification(`New group "${group_name}" added successfully!`);
        alert('Group added successfully!');
      }
  
      handleCloseAdd();
    } catch (error) {
      console.error('Error submitting group:', error.response?.data || error.message);
      alert(`Failed to submit group. Status: ${error.response?.status}, Message: ${error.response?.data}`);
    }
  };
  
  // Filter panel head and panel members dynamically
  const availableTeachersForPanelHead = teachers.filter(
    teacher => `${teacher.fname} ${teacher.lname}` !== adviser
  );
  
  const availableTeachersForPanelMembers = teachers.filter(
    teacher => `${teacher.fname} ${teacher.lname}` !== adviser && `${teacher.fname} ${teacher.lname}` !== panel_head
  );
  

  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);
  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = async (id) => {
    try {
      const group = groups.find(item => item.id === id);
      await axios.delete(`http://localhost:5001/delete-assign/${id}`);
      setGroups(groups.filter((item) => item.id !== id));
      addNotification(`Group "${group?.group_name}" deleted successfully!`);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('Failed to delete group.');
    }
  };
  

 
// Function to extract keywords from the research title
const extractKeywordsFromTitle = (title) => {
  // Split the title into words without changing the case
  const words = title.split(/[\s,]+/);
  return words.filter(word => word.length > 1); // Filtering out very short words
};

// Function to check if the teacher's expertise matches any keywords from the title
const isExpertiseApplicable = (expertise, titleKeywords) => {
  // Normalize expertise to lower case for comparison
  const lowerCaseExpertise = expertise.toLowerCase();
  return titleKeywords.some(keyword => lowerCaseExpertise.includes(keyword.toLowerCase()));
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
  const matchedTeachers = teachers.filter(teacher => {
    // Ensure expertise is an array; if not, convert from comma-separated string
    const expertiseArray = Array.isArray(teacher.expertise)
      ? teacher.expertise
      : teacher.expertise.split(',').map(item => item.trim());

    // Check if any expertise item matches any keyword
    return expertiseArray.some(expertise =>
      keywords.some(keyword => expertise.toLowerCase().includes(keyword.toLowerCase()))
    );
  });

  // Assign the first matched teacher as panel head and others as members
  if (matchedTeachers.length > 0) {
    setPanelhead(`${matchedTeachers[0].fname} ${matchedTeachers[0].lname}`);
    setPanelmembers(matchedTeachers.slice(1).map(teacher => `${teacher.fname} ${teacher.lname}`));
  }
};



const addNotification = (message) => {
  axios.post('http://localhost:5001/add-notification', { message })
    .then(response => console.log("Notification added:", response))
    .catch(error => console.error("Error adding notification:", error));
};

// Example of usage:
const handleAddAsign = () => {
  // Add logic for adding an item here
  addNotification("New assignment added!");
};

const handlePanelMemberChange = (e) => {
  const selectedName = e.target.value.trim(); // Trim spaces
  const formattedName = selectedName.replace(/[^a-zA-Z\s]/g, ''); // Remove unwanted symbols
  
  if (e.target.checked) {
    setPanelmembers(prev => [...prev, formattedName]);
  } else {
    setPanelmembers(prev => prev.filter(name => name !== formattedName));
  }
};

  return (
    <div className='assign-container'>
      <div className="assign-list1">
        <div className="assign-name">
          <h1>Assign</h1>
          <div className="controls-container">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={handleSearchChange} 
              className="assign-search-bar1"
            />
            <Button variant="contained" color="primary" onClick={handleOpenAdd} className="add-group-button">
              Add Group
            </Button>
          </div>
        </div>

        {/* Add Group Modal */}
<Modal
  open={openAddModal}
  onClose={handleCloseAdd}
  aria-labelledby="parent-modal-title"
  aria-describedby="parent-modal-description"
>
  <Box sx={style}>
    <div className="assign-input-container">
      <h1 className='assign-add'>Add Group</h1>
      <div className="assign-assignment">
        <div className="assign-input">
          <label htmlFor="group-name">Group Name</label>
          <input
            type="text"
            className='assign-group-name'
            placeholder='Enter group name'
            onChange={e => setGroupname(e.target.value)}
          />
        </div>

        <div className="assign-input1">
  <label htmlFor="names">Student Names</label>
  <div className="checkbox1-container">
    {students.map((student) => (
      <label key={student.id} className="checkbox1-label">
        <input
          type="checkbox"
          value={`${student.fname} ${student.lname}`}
          onChange={e => {
            if (e.target.checked) {
              setSelectedStudentNames(prev => [...prev, e.target.value]);
            } else {
              setSelectedStudentNames(prev => prev.filter(name => name !== e.target.value));
            }
          }}
        />
        {`${student.fname} ${student.lname}`}
      </label>
    ))}
  </div>
</div>

        <div className="assign-input2">
          <label htmlFor="research-title">Research Title</label>
          <input
            type="text"
            className='research-title'
            placeholder='Enter research title'
            onChange={handleResearchTitleChange}
          />
        </div>

        <div className="assign-input3">
          <label htmlFor="adviser">Adviser</label>
          <select
            className='adviser'
            onChange={e => setAdviser(e.target.value)}
          >
            <option value="">Select Adviser</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={`${teacher.fname} ${teacher.lname}`}>
                {`${teacher.fname} ${teacher.lname}`}
              </option>
            ))}
          </select>
        </div>
        <div className="assign-input7">
          <Button
            className='button'
            id='button'
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  </Box>
</Modal>
        {/* Edit Group Modal */}
<Modal
  open={openEditModal}
  onClose={handleCloseEdit}
  aria-labelledby="edit-modal-title"
  aria-describedby="edit-modal-description"
>
  <Box sx={style}>
    <div className="assign-input-container">
      <h1 className='assign-add'>Edit Group</h1>
      <div className="assign-assignment">
        <div className="assign-input">
          <label htmlFor="group-name">Group Name</label>
          <input 
            type="text" 
            className='assign-group-name' 
            placeholder='Enter group name' 
            value={group_name} 
            onChange={e => setGroupname(e.target.value)}
          />
        </div>

        <div className="assign-input1">
  <label htmlFor="names">Student Names</label>
  <div className="checkbox1-container">
    {students.map((student) => (
      <label key={`${student.fname}-${student.lname}`} className="checkbox1-label">
        <input
          type="checkbox"
          value={`${student.fname} ${student.lname}`}
          checked={selectedStudentNames.includes(`${student.fname} ${student.lname}`)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudentNames([...selectedStudentNames, `${student.fname} ${student.lname}`]);
            } else {
              setSelectedStudentNames(
                selectedStudentNames.filter((name) => name !== `${student.fname} ${student.lname}`)
              );
            }
          }}
        />
        {`${student.fname} ${student.lname}`}
      </label>
    ))}
  </div>
</div>


        <div className="assign-input2">
          <label htmlFor="research-title">Research Title</label>
          <input 
            type="text" 
            className='research-title' 
            placeholder='Enter research title' 
            value={research_title} 
            onChange={e => {
              setResearchtitle(e.target.value);
            }}
          />
        </div>

        <div className="assign-input3">
          <label htmlFor="adviser">Adviser</label>
          <select 
            className='adviser' 
            value={adviser} 
            onChange={e => setAdviser(e.target.value)}
          >
            <option value="">Select Adviser</option>
            {teachers.map((teacher) => (
              <option key={teacher.id}>
                {`${teacher.fname} ${teacher.lname}`}
              </option>
            ))}
          </select>
        </div>

        <div className="assign-input4">
          <label htmlFor="panel-head">Panel Head</label>
          <select 
            className='panel-head' 
            value={panel_head} 
            onChange={e => setPanelhead(e.target.value)}
          >
            <option value="">Select Panel Head</option>
            {teachers.map((teacher) => {
              // Extract keywords from the research title
              const titleKeywords = extractKeywordsFromTitle(research_title);

              // Check if the teacher's expertise is applicable based on the extracted keywords
              const isApplicable = isExpertiseApplicable(teacher.expertise, titleKeywords);
              return (
                <option 
                  key={teacher.id} 
                  style={{ color: isApplicable ? 'green' : 'red' }}
                >
                  {`${teacher.fname} ${teacher.lname}`}
                </option>
              );
            })}
          </select>
        </div>

        <div className="assign-input5">
          <label htmlFor="panel-member">Panel Members</label>
          <select 
            multiple 
            className='panel-members' 
            value={panel_members} 
            onChange={e => setPanelmembers([...e.target.selectedOptions].map(option => option.value))}
          >
            {teachers.map((teacher) => (
              <option key={teacher.id}>
                {`${teacher.fname} ${teacher.lname}`}
              </option>
            ))}
          </select>
        </div>
        

        <div className="assign-input7">
          <Button 
            className='button' 
            id='button' 
            onClick={handleSubmit}
          >
            Update Group
          </Button>
        </div>
      </div>
    </div>
  </Box>
</Modal>
<div className="table-responsive">
  <table className="assign-table">
    <thead>
      <tr>
        <th>Group Name</th>
        <th>Student Names</th>
        <th>Research Title</th>
        <th>Adviser</th>
        <th>Panel Head</th>
        <th>Panel Members</th>
        <th>Actions</th>
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
          <td>
            <div className="all-action">
              <div className="edit-assign">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => {
                    setGroupname(group.group_name);
                    setSelectedStudentNames(group.name.split(', '));
                    setResearchtitle(group.research_title);
                    setAdviser(group.adviser);
                    setPanelhead(group.panel_head);
                    setPanelmembers(group.panel_members.split(', '));
                    setGrade(group.grade);
                    setRecommendation(group.recommendation); // Added recommendation state
                    setRevisionType(group.revision_type); // Added status state
                    setEditingId(group.id);
                    handleOpenEdit(); // Open the edit modal
                  }}
                >
                          Update
                        </Button>
                      </div>
                      <div className="delete-assign">
                        <Button 
                          variant="contained" 
                          color="error" 
                          onClick={() => handleDelete(group.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </td>
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

export default Asign;
