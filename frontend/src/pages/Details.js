import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../pages/Header1";
import Sidebar from "../pages/SideBar1";
import "../pages/css/Projects.css";
import "../pages/css/Details.css";

function Details() {
    const [userInfo, setUserInfo] = useState({ name: "", email: "", employeeId: "" });
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const navigate = useNavigate();
    const { token } = useLocation().state || {};
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedInUser");
        if (storedUser) setUserInfo(JSON.parse(storedUser));
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const authToken = localStorage.getItem("token");
            if (!authToken) {
                console.error("No token found. Redirecting to login.");
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:8080/home/projects", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Error: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json();
            setProjects(data.projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to fetch projects");
        }
    };

    const fetchSprints = async (projectId) => {
        try {
            const authToken = token || localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/sprints/${projectId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

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

    const calculateRemainingDays = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const difference = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return difference > 0
            ? { remaining: difference, exceeded: null }
            : { remaining: 0, exceeded: Math.abs(difference) };
    };

    const countIssuesByStatus = (status) => {
        return selectedSprint?.sprintItems.filter((item) => item.status === status).length || 0;
    };

    const calculateTotalStoryPoints = (status) => {
        return selectedSprint?.sprintItems
            .filter((item) => item.status === status)
            .reduce((total, item) => total + item.storyPoints, 0) || 0;
    };

    const handleProjectChange = (e) => {
        const projectId = e.target.value;
        setSelectedProject(projectId);
        setSelectedSprint(null);
        fetchSprints(projectId);
    };

    const handleSprintChange = (e) => {
        const sprint = sprints.find((s) => s._id === e.target.value);
        setSelectedSprint(sprint);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredItems = (status) => {
        if (!selectedSprint) return [];
        return selectedSprint.sprintItems
            .filter(
                (item) =>
                    item.status === status &&
                    (item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.priority.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    };
    

    return (
        <div className="layout-container">
            <Sidebar userInfo={userInfo} token={localStorage.getItem("token")} />
            <div className="main-content">
                <Header />
                <div className="right-container">
                    <div className="pwelcome-message">
                        <strong>Details</strong>
                    </div>
                    <div className="dropdown-container">
                        <div>
                            <label htmlFor="project-select">Select Project:</label>
                            <select
                                id="project-select"
                                value={selectedProject || ""}
                                onChange={handleProjectChange}
                            >
                                <option value="" disabled>
                                    -- Select a Project --
                                </option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sprint-select">Select Sprint:</label>
                            <select
                                id="sprint-select"
                                value={selectedSprint?._id || ""}
                                onChange={handleSprintChange}
                                disabled={!selectedProject}
                            >
                                <option value="" disabled>
                                    -- Select a Sprint --
                                </option>
                                {sprints.map((sprint) => (
                                    <option key={sprint._id} value={sprint._id}>
                                        {sprint.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="deatils-search-container">
                        <input
                            type="text"
                            placeholder="Search issue..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="backlog-search-input"
                        />
                    </div>

                    {!selectedProject || !selectedSprint ? (
                    <div className="placeholder-container">
                       <p>
        <span>Select a <strong>Project</strong> from the dropdown menu, and then choose a <strong>Sprint</strong> that belongs to that project.</span>
    </p>
    <p className="placeholder-instruction">
        <strong>Tip:</strong> To see the sprint details, make sure both fields are selected. The available sprints are linked to the selected project.
    </p>
                    </div>
                ) : (
                        <div className="sprint-details-grid">
                        <div className="sprint-container">
                            <h3>
                                To Do ({countIssuesByStatus("To Do")}) - Total Story Points:{" "}
                                {calculateTotalStoryPoints("To Do")}
                            </h3>
                            <div className="sprint-items">
                                {filteredItems("To Do").map((item) => (
                                    <div key={item._id} className="sprint-item">
                                        <strong>{item.summary}</strong> <br />
                                        <span>{item.issueType}</span> <br />
                                        <span>{item.priority}</span> <br />
                                        <span>{item.storyPoints}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sprint-container">
                            <h3>Remaining Days</h3>
                            <div className="remaining-days">
                                
                                    {calculateRemainingDays(selectedSprint.endDate).remaining}
                               
                            </div>
                            {calculateRemainingDays(selectedSprint.endDate).exceeded && (
                                <div className="exceeded-days">
                                    Exceeded by{" "}
                                    {calculateRemainingDays(selectedSprint.endDate).exceeded} days
                                </div>
                            )}
                            <div className="sprint-dates">
                                <strong>Start Date:</strong>{" "}
                                {new Date(selectedSprint.startDate).toLocaleDateString()}
                                <br />
                                <strong>End Date:</strong>{" "}
                                {new Date(selectedSprint.endDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="sprint-container">
                            <h3>
                                In Progress ({countIssuesByStatus("In Progress")}) - Total Story
                                Points: {calculateTotalStoryPoints("In Progress")}
                            </h3>
                            <div className="sprint-items">
                                {filteredItems("In Progress").map((item) => (
                                    <div key={item._id} className="sprint-item">
                                        <strong>{item.summary}</strong> <br />
                                        <span>{item.issueType}</span> <br />
                                        <span>{item.priority}</span> <br />
                                        <span>{item.storyPoints}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sprint-container">
                            <h3>
                                Completed ({countIssuesByStatus("Done")}) - Total Story Points:{" "}
                                {calculateTotalStoryPoints("Done")}
                            </h3>
                            <div className="sprint-items">
                                {filteredItems("Done").map((item) => (
                                    <div key={item._id} className="sprint-item">
                                        <strong>{item.summary}</strong> <br />
                                        <span>{item.issueType}</span> <br />
                                        <span>{item.priority}</span> <br />
                                        <span>{item.storyPoints}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    )}

                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Details;