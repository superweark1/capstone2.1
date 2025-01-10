import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import './ResearchStudentPage.css';

const ResearchStudentPage = ({ researchId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const filesPerPage = 4;
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
            const response = await axios.post('http://localhost:5001/upload', formData, {
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
                const uploadResponse = await axios.post('http://localhost:5001/upload', formData);
                filePath = uploadResponse.data.filePath; // Get the file path from the upload response
            } catch (uploadError) {
                console.error('Error uploading file:', uploadError);
                alert('Error uploading file');
                return; // Exit if file upload fails
            }
        }
    
        // Now update the research record with the title, author, year, and optional file path
        try {
            const response = await axios.put(`http://localhost:5001/update/${fileIdToUpdate}`, {
                title,
                author,
                year,
                filePath, // Include filePath if available
            });
            alert(response.data.message); // Show success message
            fetchFiles(); // Fetch the updated list of files
            handleCloseUpdate(); // Close the update modal
        } catch (error) {
            console.error('Error updating file:', error);
            alert('Error updating file');
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await axios.get('http://localhost:5001/files');
            setFiles(response.data);
            setTotalPages(Math.ceil(response.data.length / filesPerPage));
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const downloadFile = async (filename) => {
        try {
            const response = await axios.get(`http://localhost:5001/download/${filename}`, {
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

    return (
        <div className="Research-StudentPage-container">
            <div className="search-bar-container1">
                <input type="text" placeholder="Search Research" className="search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="file-list-container1">
                <div className="file-list1">
                    <h3>Capstone Research</h3>
                    <table className="research-table1">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Year</th>
                                <th>File</th>
                              
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
                                       
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5">No files available</td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    className="custom-pagination"
                    />
                </div>
            </div>
        </div>
    );
};

export default ResearchStudentPage;
