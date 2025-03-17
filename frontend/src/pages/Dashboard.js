import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from '../pages/Header1';
import Sidebar from '../pages/SideBar1';
import CreateProjectModal from '../pages/CreateProjectModal';
import AddUserModal from '../pages/AddUserModal';
import '../pages/css/Projects.css';
import '../pages/css/Dashboard.css';

function Dashboard() {
    const [userInfo, setUserInfo] = useState({ name: '', email: '', employeeId: '' });
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newProjectId, setNewProjectId] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { project, token } = location.state || {};
    const [projectUsers, setProjectUsers] = useState([]);
    const [sprintsReported, setSprintsReported] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [sprintName, setSprintName] = useState(null);
    const issueStatuses = ["To Do", "In Progress", "Done"];
    const [sprintsAssigned, setSprintsAssigned] = useState([]);
    const [selectedSprint, setSelectedSprint] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
        fetchUserTasks();
    }, [token]);

    const fetchUserTasks = async () => {
        try {
            const response = await fetch('http://localhost:8080/usertasks/tasks', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Fetched user tasks:', data);
                setSprintsReported([...data.sprintItemsReported]);
                setSprintsAssigned([...data.sprintItemsAssigned]);
            } else {
                toast.error(data.message || 'Failed to fetch user tasks');
            }
        } catch (error) {
            toast.error('Error fetching user tasks');
            console.error('Error:', error);
        }
    };

    const incompleteSprints = sprintsAssigned.filter(
        (sprintItem) => sprintItem.status === "To Do" || sprintItem.status === "In Progress"
    );

    const completedSprints = sprintsAssigned.filter(
        (sprintItem) => sprintItem.status === "Done"
    );


    return (
        <div className="layout-container">
            <Sidebar userInfo={userInfo} token={localStorage.getItem('token')} />
            <div className="main-content">
                <Header />
                <div className="right-container">
                    <div className="pwelcome-message">
                        <strong>Dashboard</strong>
                    </div>
                    <div className="sprint-details-grid">
                        <div className="sprint-container">
                            <h3>Assigned Sprint Items</h3>
                            <div className="sprint-items"></div>
                            {sprintsAssigned.map((sprintItem) => (
                                <div key={sprintItem._id} className="sprint-item">
                                    <strong>{sprintItem.summary}</strong>
                                    <p>{sprintItem.issueType}</p>
                                    <p>{sprintItem.storyPoints}</p>
                                </div>
                            ))}
                        </div>
                        <div className="sprint-container">
                            <h3>Reported Sprint Items</h3>
                            <div className="sprint-items">
                                {sprintsReported.map((sprintItem) => (
                                    <div key={sprintItem._id} className="sprint-item">
                                        <strong>{sprintItem.summary}</strong>
                                        <p>{sprintItem.issueType}</p>
                                        <p>{sprintItem.storyPoints}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sprint-container">
                            <h3>Assigned Sprint Items Incomplete</h3>
                            <div className="sprint-items">
                                {incompleteSprints.map((sprintItem) => (
                                    <div key={sprintItem._id} className="sprint-item">
                                        <strong>{sprintItem.summary}</strong>
                                        <p>{sprintItem.issueType}</p>
                                        <p>{sprintItem.storyPoints}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sprint-container">
                            <h3>Assigned Sprint Items Completed</h3>
                            <div className="sprint-items">
                                {completedSprints.map((sprintItem) => (
                                    <div key={sprintItem._id} className="sprint-item">
                                        <strong>{sprintItem.summary}</strong>
                                        <p>{sprintItem.issueType}</p>
                                        <p>{sprintItem.storyPoints}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;