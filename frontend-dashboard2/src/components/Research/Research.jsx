import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import './Research.css';

const Research = ({ researchId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const filesPerPage = 3;
    const [fileToUpload, setFileToUpload] = useState(null); // Declare the fileToUpload state

    // Modal states
    const [openUpload, setOpenUpload] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState('');
    const [fileIdToUpdate, setFileIdToUpdate] = useState(null); // Track the file being updated



    const [viewFile, setViewFile] = useState({});

    const handleOpenUpload = () => setOpenUpload(true);
    const handleCloseUpload = () => setOpenUpload(false);

    const handleOpenView = (file) => {
        setViewFile(file);
        setOpenView(true);
    };
    const handleCloseView = () => setOpenView(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Function to open the update modal with existing file data
    const handleOpenUpdate = (file) => {
        setTitle(file.title);
        setAuthor(file.author);
        setYear(file.year);
        setFileIdToUpdate(file.id); // Set the ID of the file to be updated
        setOpenUpdate(true);
    };

    // Function to close the update modal
    const handleCloseUpdate = () => setOpenUpdate(false);

    const handleUpload = async () => {
        if (!selectedFile || !title || !author || !year) {
          setUploadStatus('Please complete all fields');
          return;
        }
      
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('author', author);
        formData.append('year', year);
      
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
      
          alert(response.data.message); // Show success message
          setSelectedFile(null);
          setTitle('');
          setAuthor('');
          setYear('');
          fetchFiles(); // Fetch the updated list of files
          handleCloseUpload(); // Close the modal
      
          // Add a notification after successful upload
          addNotification(`New research uploaded: ${title} by ${author} (${year})`);
      
        } catch (error) {
          setUploadStatus('Error uploading file');
          console.error('Error uploading file:', error);
        }
      };
      
      const handleUpdate = async () => {
        if (!title || !author || !year) {
          alert('Please complete all fields');
          return;
        }
      
        let filePath; // To store the file path if a file is uploaded
      
        // If there's a file to upload, handle the file upload first
        if (fileToUpload) { // Assuming `fileToUpload` is the file object you want to upload
          const formData = new FormData();
          formData.append('file', fileToUpload);
      
          try {
            const uploadResponse = await axios.post('${process.env.REACT_APP_API_URL}/upload', formData);
            filePath = uploadResponse.data.filePath; // Get the file path from the upload response
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            alert('Error uploading file');
            return; // Exit if file upload fails
          }
        }
      
        // Now update the research record with the title, author, year, and optional file path
        try {
          const response = await axios.put(`${process.env.REACT_APP_API_URL}/update/${fileIdToUpdate}`, {
            title,
            author,
            year,
            filePath, // Include filePath if available
          });
      
          alert(response.data.message); // Show success message
          fetchFiles(); // Fetch the updated list of files
          handleCloseUpdate(); // Close the update modal
      
          // Add a notification after successful update
          addNotification(`Research updated: ${title} by ${author} (${year})`);
      
        } catch (error) {
          console.error('Error updating file:', error);
          alert('Error updating file');
        }
      };

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/files`);
            setFiles(response.data);
            setTotalPages(Math.ceil(response.data.length / filesPerPage));
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const downloadFile = async (filename) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/download/${filename}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const filteredFiles = files.filter(file =>
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.year.toString().includes(searchTerm)
    );

    const indexOfLastFile = currentPage * filesPerPage;
    const indexOfFirstFile = indexOfLastFile - filesPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Handle viewing of specific file
    const handleView = async (fileId) => {
        try {
            const response = await axios.get(`http://localhost:5001/viewfile/${fileId}`);
            setViewFile(response.data); // Set the fetched file data
            setOpenView(true); // Open the modal
        } catch (error) {
            console.error('Error fetching file details:', error);
            alert('Error fetching file details');
        }
    };

    // Handle deleting a file
    const handleDelete = async (fileId) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            try {
                const response = await axios.delete(`http://localhost:5001/delete/${fileId}`);
                alert(response.data.message); // Show success message
                fetchFiles(); // Fetch the updated list of files
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('Error deleting file');
            }
        }
    };
    const addNotification = (message) => {
        axios.post('http://localhost:5001/add-notification', { message })
          .then(response => console.log("Notification added:", response))
          .catch(error => console.error("Error adding notification:", error));
      };
    return (
        <div className="research-container">
            <div className="file-upload-container">
                <button onClick={handleOpenUpload} className="upload-trigger-button">Upload Research</button>
            </div>

            {/* Modal for uploading research */}
            <Modal open={openUpload} onClose={handleCloseUpload}>
                <Box className="modal-box">
                    <h2>Upload Research</h2>
                    <input 
                        type="text" 
                        placeholder="Title"  
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                    <input 
                        type="text" 
                        placeholder="Author" 
                        onChange={(e) => setAuthor(e.target.value)} 
                    />
                    <input 
                        type="number" 
                        placeholder="Year" 
                        onChange={(e) => setYear(e.target.value)} 
                    />
                    <input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleFileChange} 
                    />
                    <button 
                        onClick={handleUpload} 
                        className="upload-modal-button"
                    >
                        Submit
                    </button>
                    {uploadStatus && <p>{uploadStatus}</p>} {/* Display the status of the upload */}
                </Box>
            </Modal>
            {/* Modal for viewing research details */}
            <Modal open={openView} onClose={handleCloseView}>
                <Box className="modal-box">
                    <h2>View Research</h2>
                    {viewFile ? (
                        <div>
                            <p><strong>Title:</strong> {viewFile.title}</p>
                            <p><strong>Author:</strong> {viewFile.author}</p>
                            <p><strong>Year:</strong> {viewFile.year}</p>
                            <p><strong>File:</strong> {viewFile.file_research}</p>
                        </div>
                    ) : (
                        <p>Loading file details...</p>
                    )}
                </Box>
            </Modal>
            <Modal open={openUpdate} onClose={handleCloseUpdate}>
    <Box className="modal-box">
        <h2>Update Research</h2>
        <input 
            type="text" 
            placeholder="Title"  
            value={title}
            onChange={(e) => setTitle(e.target.value)} 
        />
        <input 
            type="text" 
            placeholder="Author" 
            value={author}
            onChange={(e) => setAuthor(e.target.value)} 
        />
        <input 
            type="number" 
            placeholder="Year" 
            value={year}
            onChange={(e) => setYear(e.target.value)} 
        />
        <button 
            onClick={handleUpdate} 
            className="update-modal-button"
        >
            Update
        </button>
            </Box>
            </Modal>
            <div className="search-bar-container">
                <input type="text" placeholder="Search Research" className="search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="file-list-container">
                <div className="file-list">
                    <h3>Capstone Research</h3>
                    <table className="research-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Year</th>
                                <th>File</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFiles.length > 0 ? (
                                currentFiles.map((file) => (
                                    <tr key={file.id}>
                                        <td>{file.title}</td>
                                        <td>{file.author}</td>
                                        <td>{file.year}</td>
                                        <td>
                                            <a href="#" onClick={() => downloadFile(file.file_research)}>
                                                {file.file_research}
                                            </a>
                                        </td>
                                        <td>
                                            <button className="action-button" onClick={() => handleOpenView(file)}>View</button>
                                            <button className="action-button" onClick={() => handleOpenUpdate(file)}>update</button>
                                            <button className="action-button" onClick={() => handleDelete(file.id)}>Delete</button>
                                            
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5">No files available</td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
                </div>
            </div>
        </div>
    );
};

export default Research;
