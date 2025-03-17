import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import '../pages/css/CreateIssueModal.css';

function ShowUsersModal({ isOpen, onClose, projects = [], currentProject, users = [] }) {
    const [userInfo, setUserInfo] = useState({ name: '', email: '', employeeId: '' });
    const [selectedProject, setSelectedProject] = useState(currentProject);

    useEffect(() => {
        setSelectedProject(currentProject); 
    }, [isOpen, currentProject]);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, []);

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{projects.map(project => (
                                    <label key={project._id} value={project._id}>
                                        Members of {project.projectName}
                                    </label>
                                ))}</h2>
                    <ol>{users.map(user => (
                <li>{user}</li>
        ))}</ol>
                    <button type="button" onClick={onClose}>Close</button>
                </div>
                
                <ToastContainer />
            </div>
        )
    );
}

export default ShowUsersModal;