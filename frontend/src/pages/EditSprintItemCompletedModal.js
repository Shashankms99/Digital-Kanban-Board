import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import '../pages/css/CreateIssueModal.css';

function EditSprintItemModal({ isOpen, onClose, issueData, projects = [], sprintname }) {
    const location = useLocation();
    const [projectId, setProjectId] = useState('');
    const [sprintId, setSprintId] = useState('');
    const [issueType, setIssueType] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [reporter, setReporter] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');
    const [assignee, setAssignee] = useState('');
    const [storyPoints, setStoryPoints] = useState(0);
    const { token } = location.state || {};
    const [sprintitem, setsprintitem] = useState([]);
    const [parentSummary, setParentSummary] = useState('');
    const [childSummaries, setChildSummaries] = useState([]);

    useEffect(() => {
        if (isOpen && issueData) {
            setProjectId(issueData.projectId || '');
            setSprintId(issueData.sprintId || '');
            setIssueType(issueData.issueType || '');
            setSummary(issueData.summary || '');
            setDescription(issueData.description || '');
            setReporter(issueData.reporter || '');
            setSelectedProject(issueData.projectId || '');
            setPriority(issueData.priority || '');
            setStatus(issueData.status || '');
            setAssignee(issueData.assignee || '');
            setStoryPoints(issueData.storyPoints || 0);

            const fetchsprintitem = async () => {
                try {
                    console.log(issueData._id);
                    const response = await fetch(
                        `http://localhost:8080/sprintitems/getsubdata/${issueData._id}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        });
        
                    const data = await response.json();
                    if (response.ok) {
                        console.log("Fetched sprint item:", data);
                        setsprintitem(data.sprintItem);
                        setParentSummary(data.parentSummary || '');
                        setChildSummaries(data.childSummaries || []);
                    } else {
                        toast.error(data.message || "Failed to fetch sprint item data");
                    }
                } catch (error) {
                    toast.error("Error fetching sprint item data");
                    console.error("Error:", error);
                }
            };

            fetchsprintitem();
        }
    }, [isOpen, issueData, token]);

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Issue Details</h2>
                    <form>
                        <label>
                            Project:
                            {projects.map((project) => (
                                <input key={project._id} type="text" value={project.projectName} readOnly />
                            ))}
                        </label>

                        <label>
                            Sprint:
                            <input type="text" value={sprintname} readOnly />
                        </label>

                        <label>
                            Issue Type:
                            <select value={issueType} disabled>
                                <option value="Epic">Epic</option>
                                <option value="Bug">Bug</option>
                                <option value="Story">Story</option>
                                <option value="Task">Task</option>
                            </select>
                        </label>

                        <label>
                            Summary:
                            <input type="text" value={summary} readOnly />
                        </label>

                        <label>
                            Description:
                            <textarea value={description} readOnly />
                        </label>

                        <label>
                            Reporter:
                            <input type="text" value={reporter} readOnly />
                        </label>

                        <label>
                            Assignee:
                            <input type="text" value={assignee} readOnly />
                        </label>

                        <label>
                            Priority:
                            <select value={priority} disabled>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </label>

                        <label>
                            Status:
                            <select value={status} disabled>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </label>

                        <label>
                            Story Points:
                            <input type="number" value={storyPoints} readOnly />
                        </label>

                        <label>
                            Parent Issue Summary:
                            <input
                                type="text"
                                value={parentSummary || 'No parent issue'}
                                readOnly
                            />
                        </label>

                        <label>
                            Child Issues Summary:
                            {childSummaries.length === 0 ? (
                                <p>No child issues</p>
                            ) : (
                                <ul>
                                    {childSummaries.map((childSummary, index) => (
                                        <li key={index}>
                                            <input type="text" value={childSummary} readOnly />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </label>

                        <button type="button" onClick={onClose}>Close</button>
                    </form>
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        )
    );
}

export default EditSprintItemModal;