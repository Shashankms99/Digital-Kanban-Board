import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../pages/Header1';
import Sidebar from '../pages/SideBar';
import AddUserModal from './AddUserModal';
import ShowusersModal from './ShowusersModal';
import EditSprintItemModal from "./EditSprintItemModal";
import '../pages/css/Boards.css';
import logo from '../assets/add-user.png';

function Board() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [projectUsers, setProjectUsers] = useState([]);
    const [isModaluserOpen, setIsModaluserOpen] = useState(false);
    const [sprints, setSprints] = useState([]);
    const issueStatuses = ["To Do", "In Progress", "Done"];
    const [isEditSprintItemModalOpen, setIsEditSprintItemModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [sprintName, setSprintName] = useState(null);
    const [draggedIssue, setDraggedIssue] = useState(null);
    const [newstatus, setnewstatus] = useState(null);

    const { project, userInfo = {}, token } = location.state || {};

    useEffect(() => {
        if (!project) {
            console.error("No project data found. Redirecting to projects.");
            navigate("/projects");
        } else {
            fetchSprints();
        }
    }, [project, navigate]);

    const fetchSprints = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/sprints/started/${project._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await response.json();
            console.log(data.sprints);

            if (response.ok) {
                setSprints(data.sprints);
            } else {
                toast.error(data.message || "Failed to fetch sprints");
            }
        } catch (error) {
            toast.error("Error fetching sprints");
            console.error("Error:", error);
        }
    };

    const handleSprintItemStatusChange = async (issueId, newStatus) => {
        try {
            const response = await fetch(
                `http://localhost:8080/sprintitems/updatestatus/${issueId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                toast.success("Issue status updated successfully!");
                fetchSprints();
            } else {
                toast.error(data.message || "Failed to update issue status");
            }
        } catch (error) {
            toast.error("Error updating issue status");
            console.error("Error:", error);
        }
    };

    const handleSprintItemClick = async (issueId, sprintname) => {
        try {
            const issueResponse = await fetch(
                `http://localhost:8080/sprintitems/edit/${issueId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );
            const issueData = await issueResponse.json();
            console.log("Fetched Issue Data:", issueData);

            if (!issueResponse.ok) {
                toast.error(issueData.message || "Failed to fetch issue details");
                return;
            }

            const membersResponse = await fetch(
                `http://localhost:8080/projects/${project._id}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );
            const membersData = await membersResponse.json();

            if (!membersResponse.ok) {
                toast.error(membersData.message || "Failed to fetch project members");
                return;
            }

            setProjectUsers(membersData.members);
            setSelectedIssue(issueData);
            setSprintName(sprintname);
            console.log("Selected Issue:", issueData);
            setIsEditSprintItemModalOpen(true);
        } catch (error) {
            toast.error("Error fetching issue details or project members");
            console.error("Error:", error);
        }
    };


    const handleUpdateSprintItem = async (updatedIssue) => {
        try {
            console.log("updated issue", updatedIssue);
            const response = await fetch(
                `http://localhost:8080/sprintitems/update/${updatedIssue._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(updatedIssue),
                }
            );

            const data = await response.json();
            if (response.ok) {
                toast.success("Issue updated successfully!");
                fetchSprints();
                setIsEditSprintItemModalOpen(false);
            } else {
                toast.error(data.message || "Failed to update issue");
            }
        } catch (error) {
            toast.error("Error updating issue");
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleadduser = () => {
        setIsAddUserModalOpen(true);
    };

    const handleshowusers = async () => {
        try {
            const response = await fetch(`http://localhost:8080/projects/${project._id}/members`, {
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                setProjectUsers(data.members);
                setIsModaluserOpen(true);
            } else {
                toast.error(data.message || 'Failed to fetch project members');
            }
        } catch (error) {
            toast.error('Error fetching project members');
            console.error('Error:', error);
        }
    };

    const handleDragStart = (issue) => {
        setDraggedIssue(issue);
        document.body.classList.add("dragging");
    };

    const handleDrop = async (newstatus) => {
        if (!draggedIssue) return;

        try {
            const response = await fetch(
                `http://localhost:8080/sprintitems/updatestatus/${draggedIssue._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ status: newstatus }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Issue status updated successfully!");
                fetchSprints();
            } else {
                toast.error(data.message || "Failed to update issue status");
            }
            fetchSprints();

        } catch (error) {
            console.error("Error updating status", error);
            toast.error("Error updating status");
        } finally {
            setDraggedIssue(null);
        }
    };

    const renderSprintItemsByStatus = (items, status) => {
        return items
            .filter(item => item.status.toLowerCase() === status.toLowerCase() &&
                item.summary.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by search term
            .map(item => (
                <div key={item._id} draggable onDragStart={() => handleDragStart(item)}
                    onClick={() => handleSprintItemClick(item._id, item.sprintName)} className="sprint-item">
                    <h4>{item.summary}</h4>
                    <p>{item.description}</p>
                    <span className={`issue-type ${item.issueType.toLowerCase()}`}>{item.issueType}</span>
                    <span className="status-badge">{item.priority}</span>
                </div>
            ));
    };

    const getAllSprintItems = () => {
        return sprints.flatMap(sprint =>
            sprint.sprintItems.map(item => ({
                ...item,
                sprintName: sprint.name || 'N/A',
            }))
        );
    };

    const allSprintItems = getAllSprintItems();

    const filteredSprintItems = allSprintItems.filter(item =>
        item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-container">
            <Sidebar userInfo={userInfo} token={token || localStorage.getItem('token')} project={project} />
            <div className="main-content">
                <Header />
                <div className="right-container">
                    <div className="backlog-top">
                        <h2>{project.projectName}</h2>
                        <h1>Board</h1>
                    </div>

                    <div className="backlog-search-container">
                        <input
                            type="text"
                            placeholder="Search Issues..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="backlog-search-input"
                        />
                        <div className="user-icon1" onClick={handleshowusers}>Team Members</div>
                        <ShowusersModal
                            isOpen={isModaluserOpen}
                            onClose={() => setIsModaluserOpen(false)}
                            projects={[project]}
                            currentProject={project?._id}
                            users={projectUsers}
                        />
                        <div className="add-user-icon" onClick={handleadduser}>
                            <img src={logo} alt="Add user" className="user-logo" />
                        </div>
                    </div>

                    {sprints.length > 0 ? (
                        <div className="board-columns">
                            <div className="board-column todo-column" onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop("To Do")}>
                                <h4>To Do</h4>
                                {sprints.map((sprint) => renderSprintItemsByStatus(sprint.sprintItems, 'to do'))}
                            </div>

                            <div className="board-column in-progress-column" onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop("In Progress")}>
                                <h4>In Progress</h4>
                                {sprints.map((sprint) => renderSprintItemsByStatus(sprint.sprintItems, 'in progress'))}
                            </div>

                            <div className="board-column done-column" onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop("Done")}>
                                <h4>Done</h4>
                                {sprints.map((sprint) => renderSprintItemsByStatus(sprint.sprintItems, 'done'))}
                            </div>
                        </div>
                    ) : (
                        <p>No sprints available</p>
                    )}

                    <div className='sprinttableheader'>
                        <center><h3>Sprint Items</h3></center>
                    </div>

                    {filteredSprintItems.length > 0 ? (
    <div className="sprint-items-table">
        <table>
            <thead>
                <tr>
                    <th>Summary</th>
                    <th>Sprint Name</th>
                    <th>Issue Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Reporter</th>
                    <th>Assignee</th>
                </tr>
            </thead>
            <tbody>
                {filteredSprintItems.map(item => (
                    <tr key={item._id}>
                        <td style={{ color: 'blue', cursor: 'pointer' }}
                            onClick={() => handleSprintItemClick(item._id, item.sprintName)}
                            className="issue-summary"><u>{item.summary}</u></td>
                        <td>{item.sprintName}</td>
                        <td>{item.issueType}</td>
                        <td>{item.priority}</td>
                        <td>
                            <select
                                value={item.status}
                                onChange={(e) => handleSprintItemStatusChange(item._id, e.target.value)}
                            >
                                {issueStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>{item.reporter}</td>
                        <td>{item.assignee}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
) : (
    <p>No matching sprint items found</p>
)}


                    <AddUserModal
                        isOpen={isAddUserModalOpen}
                        projectId={project._id}
                        onClose={() => setIsAddUserModalOpen(false)}
                    />

                    {selectedIssue && (
                        <EditSprintItemModal
                            isOpen={isEditSprintItemModalOpen}
                            onClose={() => setIsEditSprintItemModalOpen(false)}
                            onSubmit={handleUpdateSprintItem}
                            issueData={selectedIssue}
                            projects={[project]}
                            currentProject={project._id}
                            users={projectUsers}
                            sprintname={sprintName}
                        />
                    )}
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Board;