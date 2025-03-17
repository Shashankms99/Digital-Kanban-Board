import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from '../pages/Header1'; 
import Sidebar from '../pages/SideBar1';
import CreateProjectModal from '../pages/CreateProjectModal';
import AddUserModal from '../pages/AddUserModal';
import '../pages/css/Projects.css'; 

function Projects() {
    const [userInfo, setUserInfo] = useState({ name: '', email: '', employeeId: '' });
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newProjectId, setNewProjectId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Redirecting to login.');
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:8080/home/projects', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Error: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json();

            if (!Array.isArray(data.projects)) {
                console.error('Unexpected response format:', data);
                return;
            }

            setProjects(data.projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleCreateProject = () => {
        setShowCreateModal(true);
    };

    const handleProjectCreated = (projectId) => {
        setNewProjectId(projectId);
        setShowAddUserModal(true);
        fetchProjects();
        setShowCreateModal(false);
    };

    const handleProjectClick = (project) => {
        const token = localStorage.getItem('token');
        navigate('/backlog', { state: { project, userInfo, token } });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProjects = projects.filter((project) =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-container">
            <Sidebar userInfo={userInfo} token={localStorage.getItem('token')} />
            <div className="main-content">
            <Header />
                <div className="right-container">
                    <div className="pwelcome-message">
                        <button className="create-newproject-button" onClick={handleCreateProject}>
                            Create New Project
                        </button>
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by project name or key..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    <div className="project-list">
                        <h2>Your Projects</h2>
                        {filteredProjects.length === 0 ? (
        <div className="no-projects-message">
            <p>
        🚀 No projects found! <br />
        Let's get started by <span onClick={handleCreateProject} className="highlight">creating your first project</span> and collaborating with your team. 🎉
    </p>
            <div className="no-projects-message">
    
    <div className="steps-container">
        <h4>Follow these simple steps:</h4>
        <ol>
            <li>Click on the <strong>"Create New Project"</strong> button above.</li>
            <li>Provide a unique <strong>Project Name</strong> and <strong>Key</strong>.</li>
            <li>Invite team members to join and contribute.</li>
        </ol>
    </div>
</div>
<p>
            🌟 If a project is already created, ask your teammates to add you as a member so you can start collaborating instantly!
        </p>
        </div>
    ) : (
                        <div className="project-table-container">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Key</th>
                                        <th>Lead</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map((project) => (
                                        <tr
                                            key={project._id}
                                            onClick={() => handleProjectClick(project)}
                                            className="project-row"
                                        >
                                            <td>{project.projectName}</td>
                                            <td>{project.key}</td>
                                            <td>{project.lead}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
    )}
                    </div>
                    <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onProjectCreated={handleProjectCreated}
            />

            <AddUserModal
                isOpen={showAddUserModal}
                projectId={newProjectId}
                onClose={() => setShowAddUserModal(false)}
            />
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Projects;