import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import '../pages/css/CreateProject.css';
import Header from '../pages/Header';

function CreateProject() {
    const [projectName, setProjectName] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [lead, setLead] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

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
  
        const projectData = {
            projectName,
            key: projectKey, 
            lead,
        };

        setIsLoading(true); 
    
        try {
            console.log(projectData);
            const response = await fetch('http://localhost:8080/createproject/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });
    
            const data = await response.json();
            setIsLoading(false); 
            
            if (response.ok) {
                toast.success('Project Created Successfully!');
                setTimeout(() => {
                    navigate('/adduser', { state: { projectId: data.project._id } });
                }, 1000); 
            } else {
                toast.error(data.message || 'Error creating project');
                console.error('Response Error:', data);
            }
        } catch (error) {
            setIsLoading(false); 
            toast.error('Error creating project');
            console.error('Error:', error);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div>
            <Header />
            <div className="create-project-wrapper">
                <div className="create-project-container">
                    <h1>Create New Project</h1><br></br>
                    <form onSubmit={handleSubmit} className="create-project-form">
                        <div className="form-group">
                            <label>Project Name:</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder='Enter the Project name'
                                required
                            />
                        </div>
                        <br />
                        <div className="form-group">
                            <label>Project Key:</label>
                            <input
                                type="text"
                                value={projectKey}
                                onChange={(e) => setProjectKey(e.target.value)}
                                placeholder='Enter the key'
                                required

                            />
                        </div>
                        <button type="submit" className="create-project-button" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                        <button type="button" onClick={handleCancel} className="cancel-button">
                            Cancel
                        </button>
                    </form>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

export default CreateProject;