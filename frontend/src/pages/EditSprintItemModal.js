import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import '../pages/css/CreateIssueModal.css';

function EditSprintItemModal({ isOpen, onClose, onSubmit, issueData, projects = [], currentProject, users = [], sprintname}) {
    const location = useLocation();
    const [projectId, setprojectId] = useState('');
    const [sprintId, setsprintId] = useState('');
    const [issueType, setIssueType] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [reporter] = useState(issueData?.reporter || '');
    const [selectedProject, setSelectedProject] = useState(currentProject);
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('To Do');
    const [assignee, setAssignee] = useState('');
    const [storyPoints, setStoryPoints] = useState(0);
    const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
    const { token } = location.state || {};
    const [sprintitem, setsprintitem] = useState([]);
    const [parentSummary, setParentSummary] = useState('');
    const [childSummaries, setChildSummaries] = useState([]);

    useEffect(() => {
        if (isOpen && issueData) {
            setprojectId(issueData.projectId || '');
            setsprintId(issueData.sprintId || '');
            setIssueType(issueData.issueType || '');
            setSummary(issueData.summary || '');
            setDescription(issueData.description || '');
            setSelectedProject(issueData.projectId || currentProject);
            setPriority(issueData.priority || 'Medium');
            setStatus(issueData.status || 'To Do');
            setAssignee(issueData.assignee || '');
            setStoryPoints(issueData.storyPoints || 0);
        }

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
    }, [isOpen, issueData, token]);
    


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!issueType || !summary || !selectedProject || storyPoints === '') {
            toast.error('Issue Type, Summary, Project, and Story Points are required!');
            return;
        }

        if (isNaN(storyPoints) || storyPoints < 0) {
            toast.error('Please enter a valid number for Story Points!');
            return;
        }

        const updatedIssueData = {
            ...issueData,
            issueType,
            summary,
            description,
            reporter,
            projectId: selectedProject,
            sprintId,
            priority,
            status,
            assignee,
            storyPoints: parseInt(storyPoints,10),
        };

        onSubmit(updatedIssueData);

        setTimeout(() => {
            onClose();
        }, 3000);
    };

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Edit Issue</h2>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Project:
                            {projects.map((project) => (
                                    <input type="text" value={project.projectName} readOnly />
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
                            <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} required />
                        </label>

                        <label>
                            Description:
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        </label>

                        <label>
                            Reporter:
                            <input type="text" value={reporter} readOnly />
                        </label>

                        <label>
                            Assignee:
                            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                                <option value="">Select Assignee</option>
                                {users.map((user) => (
                                    <option key={user} value={user}>
                                        {user}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Priority:
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </label>

                        <label>
                            Status:
                            <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </label>

                        <label>
    Story Points:
    <select
        value={storyPoints}
        onChange={(e) => setStoryPoints(e.target.value)}
        required
        
    >
        <option value="">Select Story Points</option>
        {fibonacciNumbers.map((num) => (
            <option key={num} value={num}>
                {num}
            </option>
        ))}
    </select>
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

                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </form>
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        )
    );
}

export default EditSprintItemModal;