import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import '../pages/css/CreateIssueModal.css';

function CreateIssueModal({ isOpen, onClose, onSubmit, email, projects = [], currentProject, users = [] }) {
    const [issueType, setIssueType] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [reporter] = useState(email);
    const [selectedProject, setSelectedProject] = useState(currentProject);
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('To Do');
    const [assignee, setAssignee] = useState('');
    const [storyPoints, setStoryPoints] = useState(0);

    const [backlogs, setBacklogs] = useState([]);
    const [sprintItems, setSprintItems] = useState([]);
    const [parentEpic, setParentEpic] = useState('');
    const [parentStory, setParentStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [sprints, setSprints] = useState([]);
    const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

    useEffect(() => {
        if (isOpen) {
            setIssueType('');
            setSummary('');
            setDescription('');
            setSelectedProject(currentProject);
            setPriority('Medium');
            setStatus('To Do');
            setAssignee('');
            setStoryPoints(0);
            setParentEpic('');
            setParentStory('');
            setBacklogs([]);
            setSprints([]);
            fetchBacklogs();
            fetchSprints();
        }
    }, [isOpen, currentProject]);

    const fetchBacklogs = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8080/projects/${selectedProject}/backlogs`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();
            if (response.ok) {
                setBacklogs(data.backlogs);
            } else {
                toast.error(data.message || "Failed to fetch backlogs");
            }
        } catch (error) {
            toast.error("Error fetching backlogs");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSprints = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8080/sprints/${selectedProject}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        } finally {
            setLoading(false);
        }
    };

    const handleIssueTypeChange = (e) => {
        const value = e.target.value;
        setIssueType(value);
        setParentEpic('');
        setParentStory('');
        setBacklogs([]);
        setSprints([]);
        if (value === 'Bug' || 'Task') {
            fetchBacklogs();
            fetchSprints();
        } else if (value === 'Story') {
            fetchBacklogs();
            fetchSprints();
        } else {
            setParentEpic('');
            setParentStory('');
            setBacklogs([]);
            setSprints([]);
        }
    };

    const handleParentEpicChange = (e) => {
        const selectedEpic = e.target.value;
        setParentEpic(selectedEpic);
    };

    const handleParentStoryChange = (e) => {
        const selectedStory = e.target.value;
        setParentStory(selectedStory);
    };

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
    
        let issueData = {
            issueType,
            summary,
            description,
            reporter,
            projectId: selectedProject,
            priority,
            status,
            assignee,
            storyPoints: parseInt(storyPoints,10),
        };
    
        if (issueType !== 'Epic') {
            let parent = null;
    
            if (issueType === 'Story') {
                parent = {
                    id: parentEpic,
                    model: 'sprintitems',
                };
            } else if (issueType === 'Bug' || issueType === 'Task') {
                parent = {
                    id: parentStory,
                    model: 'sprintitems',
                };
            }
    
            if (parent && parent.id && backlogs.some(item => item._id === parent.id)) {
                parent.model = 'backlogs';
            }
    
            issueData.parent = parent;
        }
    
        onSubmit(issueData);
        setTimeout(() => {
            onClose();
        }, 3000);
    };

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Create New Issue</h2>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Project:
                            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} required>
                                <option value="">Select a project</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Issue Type:
                            <select value={issueType} onChange={handleIssueTypeChange} required>
                                <option value="">Select issue type</option>
                                <option value="Epic">Epic</option>
                                <option value="Bug">Bug</option>
                                <option value="Story">Story</option>
                                <option value="Task">Task</option>
                            </select>
                        </label>

{issueType === 'Story' && (
    <label>
        Parent Epic:
        {loading ? (
            <span>Loading...</span>
        ) : (
            <select value={parentEpic} onChange={handleParentEpicChange} required>
                <option value="">Select Parent Epic</option>
                {[
                    ...backlogs,
                    ...(sprints?.flatMap(sprint => sprint.sprintItems) || []),
                ]
                    .filter(item => item.issueType === 'Epic')
                    .map(epic => (
                        <option key={epic._id} value={epic._id}>
                            {epic.summary}
                        </option>
                    ))}
            </select>
        )}
    </label>
)}

{(issueType === 'Bug' || issueType === 'Task') && (
    <label>
        Parent Story:
        {loading ? (
            <span>Loading...</span>
        ) : (
            <select value={parentStory} onChange={handleParentStoryChange} required>
                <option value="">Select Parent Story</option>
                {[
                    ...backlogs,
                    ...(sprints?.flatMap(sprint => sprint.sprintItems) || []),
                ]
                    .filter(item => item.issueType === 'Story')
                    .map(story => (
                        <option key={story._id} value={story._id}>
                            {story.summary}
                        </option>
                    ))}
            </select>
        )}
    </label>
)}

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

                        <button type="submit" className="btn-create">Create Issue</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </form>
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        )
    );
}

export default CreateIssueModal;