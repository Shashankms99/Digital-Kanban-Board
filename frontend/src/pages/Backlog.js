import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../pages/Header1";
import Sidebar from "../pages/SideBar";
import CreateIssueModal from "./CreateIssueModal";
import AddUserModal from "./AddUserModal";
import ShowusersModal from "./ShowusersModal";
import EditIssueModal from "./EditIssueModal";
import EditSprintItemModal from "./EditSprintItemModal";
import EditSprintItemCompletedModal from "./EditSprintItemCompletedModal";
import StartSprintModal from "./StartSprintModal";
import CompleteSprintModal from "./CompleteSprintModal";
import "../pages/css/Backlog.css";
import logo from "../assets/add-user.png";

function Backlog() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchSprintTerm, setSprintSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditIssueModalOpen, setIsEditIssueModalOpen] = useState(false);
    const [isEditSprintItemModalOpen, setIsEditSprintItemModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const { project, userInfo = {}, token } = location.state || {};
    const [projectUsers, setProjectUsers] = useState([]);
    const [backlogs, setBacklogs] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [sprintName, setSprintName] = useState(null);
    const [isModaluserOpen, setIsModaluserOpen] = useState(false);
    const issueStatuses = ["To Do", "In Progress", "Done"];
    const [sprints, setSprints] = useState([]);
    const [draggedIssue, setDraggedIssue] = useState(null);
    const [isStartSprintModalOpen, setIsStartSprintModalOpen] = useState(false);
    const [isCompleteSprintModalOpen, setIsCompleteSprintModalOpen] = useState(false);
    const [isEditSprintItemCompletedModalOpen, setIsEditSprintItemCompletedModalOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [isEditingSprintName, setIsEditingSprintName] = useState(null);
    const [editedSprintName, setEditedSprintName] = useState("");

    useEffect(() => {
        if (!project) {
            console.error("No project data found. Redirecting to projects.");
            navigate("/projects");
        } else {
            fetchBacklogs();
            fetchSprints();
        }
    }, [project, navigate]);

    const fetchBacklogs = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/projects/${project._id}/backlogs`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await response.json();
            if (response.ok) {
                console.log("Fetched backlogs:", data);
                setBacklogs(data.backlogs);
            } else {
                toast.error(data.message || "Failed to fetch backlogs");
            }
        } catch (error) {
            toast.error("Error fetching backlogs");
            console.error("Error:", error);
        }
    };

    const fetchSprints = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/sprints/${project._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await response.json();
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

    const handleDragStart = (issue) => {
        setDraggedIssue(issue);
        document.body.classList.add("dragging");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSprintSearchChange = (e) => {
        setSprintSearchTerm(e.target.value);
    };

    const handleDrop = async (sprintId) => {
        if (!draggedIssue) return;

        try {
            const child = draggedIssue.child
                ? draggedIssue.child.map(childId => ({
                    id: childId,
                    model: draggedIssue.childModel && draggedIssue.childModel[0]
                }))
                : undefined;
            const issuePayload = {
                projectId: project._id,
                sprintId,
                summary: draggedIssue.summary,
                issueType: draggedIssue.issueType,
                description: draggedIssue.description,
                priority: draggedIssue.priority,
                reporter: draggedIssue.reporter,
                assignee: draggedIssue.assignee || '',
                storyPoints: draggedIssue.storyPoints,
                backlogId: draggedIssue._id,
                ...(child && { child }),
            };

            if (draggedIssue.parent) {
                issuePayload.parent = {
                    id: draggedIssue.parent,
                    model: draggedIssue.parentModel,
                };
            }

            console.log(issuePayload);

            const response = await fetch(`http://localhost:8080/sprintitems/${sprintId}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                },
                body: JSON.stringify(issuePayload),
            });

            const data = await response.json();

            if (response.ok) {
                setBacklogs((prevBacklogs) =>
                    prevBacklogs.filter((issue) => issue._id !== draggedIssue._id)
                );

                console.log(project._id, draggedIssue._id);

                await fetch(`http://localhost:8080/projects/${project._id}/removeBacklog/${draggedIssue._id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                });
                fetchBacklogs();
                fetchSprints();
                toast.success("Issue moved to sprint successfully");
            } else {
                toast.error(data.message || "Failed to move issue to sprint");
            }
        } catch (error) {
            console.error("Error moving issue to sprint:", error);
            toast.error("Error moving issue to sprint");
        } finally {
            setDraggedIssue(null);
        }
    };


    const handleIssueClick = async (issueId) => {
        try {
            const issueResponse = await fetch(
                `http://localhost:8080/backlogs/${issueId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );
            const issueData = await issueResponse.json();

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
            setIsEditIssueModalOpen(true);
        } catch (error) {
            toast.error("Error fetching issue details or project members");
            console.error("Error:", error);
        }
    };

    const handleSprintNameChange = async (sprintId, newName) => {
        console.log("Attempting to change sprint name to:", newName);

        try {
            const response = await fetch(`http://localhost:8080/sprints/updateName/${sprintId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ newName: newName.trim() }),
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                toast.success("Sprint name updated successfully!");
                fetchSprints();
            } else {
                toast.error(data.message || "Failed to update sprint name");
            }
        } catch (error) {
            console.error("Error updating sprint name:", error);
            toast.error("Error updating sprint name");
        }
    };

    const handleStartEditingSprintName = (sprintId, currentName) => {
        console.log("Starting to edit sprint:", sprintId, "Current name:", currentName);
        setIsEditingSprintName(sprintId);
        setEditedSprintName(currentName);
    };

    const handleSaveSprintName = (sprintId) => {
        console.log("Saving sprint name:", editedSprintName);
        if (editedSprintName.trim() === "") {
            toast.error("Sprint name cannot be empty");
            return;
        }

        console.log("Sprint ID to update:", sprintId, "New Name:", editedSprintName);
        handleSprintNameChange(sprintId, editedSprintName);
        setIsEditingSprintName(null);
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


    const handleSprintItemCompletedClick = async (issueId, sprintname) => {
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

            setSelectedIssue(issueData);
            setSprintName(sprintname);
            console.log("Selected Issue:", issueData);
            console.log(issueData._id);
            setIsEditSprintItemCompletedModalOpen(true);
        } catch (error) {
            toast.error("Error fetching issue details or project members");
            console.error("Error:", error);
        }
    };

    const handleUpdateIssue = async (updatedIssue) => {
        try {
            console.log(updatedIssue);
            const response = await fetch(
                `http://localhost:8080/backlogs/update/${updatedIssue._id}`,
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
                fetchBacklogs();
                setIsEditIssueModalOpen(false);
            } else {
                toast.error(data.message || "Failed to update issue");
            }
        } catch (error) {
            toast.error("Error updating issue");
        }
    };

    const handleUpdateSprintItem = async (updatedIssue) => {
        console.log(updatedIssue);
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

    const handleshowusers = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/projects/${project._id}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();
            if (response.ok) {
                setProjectUsers(data.members);
                setIsModaluserOpen(true);
            } else {
                toast.error(data.message || "Failed to fetch project members");
            }
        } catch (error) {
            toast.error("Error fetching project members");
            console.error("Error:", error);
        }
    };

    const handleStartSprint = (sprint) => {
        setSelectedSprint(sprint);
        setIsStartSprintModalOpen(true);
    };

    const handleCompleteSprint = (sprint) => {
        setSelectedSprint(sprint);
        setIsCompleteSprintModalOpen(true);
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const response = await fetch(
                `http://localhost:8080/backlogs/update/${issueId}`,
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
                fetchBacklogs();
            } else {
                toast.error(data.message || "Failed to update issue status");
            }
        } catch (error) {
            toast.error("Error updating issue status");
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

    const handleCreateIssueClick = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/projects/${project._id}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();
            if (response.ok) {
                setProjectUsers(data.members);
                setIsModalOpen(true);
            } else {
                toast.error(data.message || "Failed to fetch project members");
            }
        } catch (error) {
            toast.error("Error fetching project members");
            console.error("Error:", error);
        }
    };

    const handleCreateIssue = async (issueData) => {
        try {
            console.log(issueData);
            const response = await fetch(
                `http://localhost:8080/backlogs/createissue`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ ...issueData, projectId: project._id }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                fetchBacklogs();
                setIsModalOpen(false);
                toast.success("Issue created successfully!");
            } else {
                toast.error(data.message || "Error creating issue");
            }
        } catch (error) {
            toast.error("Error creating issue");
            console.error("Error:", error);
        }
    };

    const handleCreateSprint = async () => {
        const sprintNumber = sprints.length + 1;
        const sprintName = `${project?.key || "SPR"} Sprint${sprintNumber}`;
        const sprintData = {
            projectId: project?._id,
            name: sprintName,
        };

        try {
            console.log({ sprintData });
            const response = await fetch("http://localhost:8080/sprints/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                },
                body: JSON.stringify(sprintData),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Sprint created successfully!");
                fetchSprints();
            } else {
                toast.error(data.message || "Failed to create sprint");
            }
        } catch (error) {
            toast.error("Error creating sprint");
            console.error("Error:", error);
        }
    };

    const handleAddUserClick = () => {
        setIsAddUserModalOpen(true);
    };

    return (
        <div className="layout-container">
            <Sidebar
                userInfo={userInfo}
                token={token || localStorage.getItem("token")}
                project={project}
            />
            <div className="main-content">
                <Header />
                <div className="right-container">
                    <div className="backlog-top">
                        <h2>{project.projectName}</h2>
                        <h1>Backlogs</h1>
                    </div>
                    <div className="backlog-search-container">
                        <input
                            type="text"
                            placeholder="Search Sprint Name..."
                            value={searchSprintTerm}
                            onChange={handleSprintSearchChange}
                            className="backlog-search-input"
                        />
                        <div className="user-icon1" onClick={handleshowusers}>
                            Team Members
                        </div>
                        <ShowusersModal
                            isOpen={isModaluserOpen}
                            onClose={() => setIsModaluserOpen(false)}
                            projects={[project]}
                            currentProject={project?._id}
                            users={projectUsers}
                        />
                        <div className="add-user-icon" onClick={handleAddUserClick}>
                            <img src={logo} alt="Add user" className="user-logo" />
                        </div>
                    </div>

                    <div>
                        <div className="sprint-section">
                            <div className="sprint-header">
                                <h3>Sprints ({sprints.length} sprints)</h3>
                                <button className="create-sprint" onClick={handleCreateSprint}>
                                    + Create Sprint
                                </button>
                            </div>

                            <div className="sprint-scrollable-section">
                                {sprints.length === 0 ? (
                                    <div className="sprintitem-content">
                                        <p className="sprint-plan-title">Plan your sprint</p>
                                    </div>
                                ) : (
                                    sprints.filter((sprint) =>
                                        sprint.name.toLowerCase().includes(searchSprintTerm.toLowerCase())
                                    ).map((sprint) => {
                                        const totalStoryPoints = sprint.sprintItems?.reduce((sum, item) => sum + (item.storyPoints || 0), 0) || 0;

                                        return (
                                            <div key={sprint._id} className="sprint-box">
                                                <div
                                                    className="sprint-header"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={() => handleDrop(sprint._id)}
                                                >
                                                    {isEditingSprintName === sprint._id ? (
                                                        <input
                                                            type="text"
                                                            value={editedSprintName}
                                                            onChange={(e) => {
                                                                console.log("Editing sprint name:", e.target.value);
                                                                setEditedSprintName(e.target.value);
                                                            }}
                                                            onBlur={() => handleSaveSprintName(sprint._id)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleSaveSprintName(sprint._id);
                                                                if (e.key === "Escape") setIsEditingSprintName(null);
                                                            }}
                                                            autoFocus
                                                            disabled={sprint.status === 'completed'}
                                                        />
                                                    ) : (
                                                        <h3
                                                            onClick={() =>
                                                                sprint.status !== "completed" &&
                                                                handleStartEditingSprintName(sprint._id, sprint.name)
                                                            }
                                                            style={{
                                                                cursor: sprint.status !== "completed" ? "pointer" : "default",
                                                            }}
                                                        >
                                                            {sprint.name} ({sprint.sprintItems?.length || 0} issues)
                                                        </h3>
                                                    )}

                                                    <h3>
                                                        {totalStoryPoints} Story Points
                                                    </h3>

                                                    {sprint.status === 'created' && (
                                                        <button className="start-sprint-btn" onClick={() => handleStartSprint(sprint)}>
                                                            Start Sprint
                                                        </button>
                                                    )}

                                                    {sprint.status === 'started' && (
                                                        <button className="complete-sprint-btn" onClick={() => handleCompleteSprint(sprint)}>
                                                            Complete Sprint
                                                        </button>
                                                    )}

                                                    {sprint.status === 'completed' && (
                                                        <span className="sprint-completed">Completed</span>
                                                    )}
                                                </div>

                                                <div
                                                    className="sprint-content"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={() => handleDrop(sprint._id)}
                                                >
                                                    {sprint.sprintItems && sprint.sprintItems.length > 0 ? (
                                                        <div className="backlog-content">
                                                            <table className="backlog-table">
                                                                <tbody>
                                                                    {sprint.sprintItems.map((item) => (
                                                                        <tr key={item._id}>
                                                                            <u>
                                                                                <td
                                                                                    style={{ color: "blue", cursor: "pointer" }}
                                                                                    onClick={() =>
                                                                                        sprint.status === "completed"
                                                                                            ? handleSprintItemCompletedClick(item._id, sprint.name)
                                                                                            : handleSprintItemClick(item._id, sprint.name)
                                                                                    }
                                                                                    className="issue-summary"
                                                                                >
                                                                                    {item.summary}
                                                                                </td>
                                                                            </u>
                                                                            <td>{item.issueType}</td>
                                                                            <td>
                                                                                <select
                                                                                    value={item.status}
                                                                                    onChange={(e) =>
                                                                                        handleSprintItemStatusChange(item._id, e.target.value)
                                                                                    }
                                                                                    disabled={sprint.status === "completed"}
                                                                                >
                                                                                    {issueStatuses.map((status) => (
                                                                                        <option key={status} value={status}>
                                                                                            {status}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </td>
                                                                            <td>{item.assignee}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="no-items-message">
                                                            Drag issues from backlog and start your sprint.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>



                            <button className="create-issue" onClick={handleCreateIssueClick}>
                                + Create Issue
                            </button>
                            <button className="create-sprint" onClick={handleCreateSprint}>
                                + Create Sprint
                            </button>
                        </div>
                    </div>

                    <div className="backlog-section">
                        <div className="backlog-header">
                            <h3>Backlog ({backlogs.length} issues)</h3>
                            <div className="backlog-search-container">
                                <input
                                    type="text"
                                    placeholder="Search Backlogs..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="backlog-search-input"
                                />
                            </div>
                        </div>
                        {backlogs.length === 0 ? (
                            <div className="no-backlogs-message">
                                <p>Create backlogs to start working on the project.</p>
                            </div>
                        ) : (
                            <div className="backlog-content">
                                <table className="backlog-table">
                                    <thead>
                                        <tr>
                                            <th>Summary</th>
                                            <th>Issue Type</th>
                                            <th>Status</th>
                                            <th>Assignee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backlogs
                                            .filter((backlog) =>
                                                backlog.summary.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).map((backlog) => (
                                                <tr key={backlog._id}
                                                    draggable
                                                    onDragStart={() => handleDragStart(backlog)}>
                                                    <u>
                                                        <td
                                                            style={{ color: "blue" }}
                                                            onClick={() => handleIssueClick(backlog._id)}
                                                            className="issue-summary"
                                                        >
                                                            {backlog.summary}
                                                        </td>
                                                    </u>
                                                    <td>{backlog.issueType}</td>
                                                    <td>
                                                        <select
                                                            value={backlog.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(backlog._id, e.target.value)
                                                            }
                                                        >
                                                            {issueStatuses.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>{backlog.assignee}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <button className="create-issue" onClick={handleCreateIssueClick}>
                            + Create Issue
                        </button>
                    </div>

                    <CreateIssueModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleCreateIssue}
                        projects={[project]}
                        email={userInfo.email}
                        currentProject={project?._id}
                        users={projectUsers}
                    />

                    <AddUserModal
                        isOpen={isAddUserModalOpen}
                        projectId={project._id}
                        onClose={() => setIsAddUserModalOpen(false)}
                    />

                    {selectedIssue && (
                        <EditIssueModal
                            isOpen={isEditIssueModalOpen}
                            onClose={() => setIsEditIssueModalOpen(false)}
                            onSubmit={handleUpdateIssue}
                            issueData={selectedIssue}
                            projects={[project]}
                            currentProject={project._id}
                            users={projectUsers}
                        />
                    )}

                    <StartSprintModal
                        isOpen={isStartSprintModalOpen}
                        onClose={() => setIsStartSprintModalOpen(false)}
                        sprint={selectedSprint}
                        onUpdateSprint={fetchSprints}
                        token={token}
                    />

                    {selectedSprint && (
                        <CompleteSprintModal
                            isOpen={isCompleteSprintModalOpen}
                            onClose={() => setIsCompleteSprintModalOpen(false)}
                            sprint={selectedSprint}
                            onUpdateSprint={fetchSprints}
                            token={token || localStorage.getItem("token")}
                        />
                    )}

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

                    {selectedIssue && (
                        <EditSprintItemCompletedModal
                            isOpen={isEditSprintItemCompletedModalOpen}
                            onClose={() => setIsEditSprintItemCompletedModalOpen(false)}
                            onSubmit={handleUpdateSprintItem}
                            issueData={selectedIssue}
                            projects={[project]}
                            currentProject={project._id}
                            sprintname={sprintName}
                        />
                    )}

                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Backlog;