import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../pages/css/CreateProjectModel.css';

function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
    const [projectName, setProjectName] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [lead, setLead] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            const userInfo = JSON.parse(storedUser);
            setLead(userInfo.email);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!projectName || !projectKey) {
            toast.error('Both Project Name and Key are required!');
            return;
        }
    
        const projectData = { projectName, key: projectKey, lead };
        setIsLoading(true);
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/createproject/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });
    
            const data = await response.json();
            console.log('Response Data:', data);
    
            setIsLoading(false);
    
            if (response.ok && data.success) {
                toast.success(data.message || 'Project Created Successfully!');
                setTimeout(() => {
                    onProjectCreated(data.project._id);
                    onClose();
                    setProjectName('');
                    setProjectKey('');
                }, 3000);
            } else {
                toast.error(data.message || 'Error creating project');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            setIsLoading(false);
            toast.error('Error creating project');
        }
    };
    
    const handleCancel = () => {
        setProjectName('');
        setProjectKey('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Name:</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Project Key:</label>
                        <input
                            type="text"
                            value={projectKey}
                            onChange={(e) => setProjectKey(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Project'}
                    </button>
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                </form>
                <ToastContainer position="top-right" autoClose={1000} />
            </div>
        </div>
    );
}

export default CreateProjectModal;