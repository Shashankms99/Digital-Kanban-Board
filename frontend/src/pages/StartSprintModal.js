import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import '../pages/css/CreateIssueModal.css';

const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const StartSprintModal = ({ isOpen, onClose, sprint, onUpdateSprint, token }) => {
    const [sprintName, setSprintName] = useState('');
    const [duration, setDuration] = useState('2 weeks');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const calculateEndDate = (start, dur) => {
        const startDateObj = new Date(start);
        const weeks = parseInt(dur.split(' ')[0]);
        return formatDate(
            new Date(startDateObj.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
        );
    };

    useEffect(() => {
        if (sprint) {
            setSprintName(sprint.name || ''); 
            setStartDate(formatDate(sprint.startDate || new Date())); 
            setDuration(sprint.duration || '2 weeks'); 
        }
    }, [sprint, isOpen]);

    useEffect(() => {
        if (startDate && duration) {
            setEndDate(calculateEndDate(startDate, duration));
        }
    }, [startDate, duration]);

    const handleSave = async () => {
        const sprintData = {
            projectId: sprint.projectId,
            name: sprintName,
            duration,
            startDate,
            endDate,
            status: 'started',
        };
    
        console.log('Sending sprint data:', sprintData);
    
        try {
            const response = await fetch(`http://localhost:8080/sprints/update/${sprint._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || localStorage.getItem('token')}`,
                },
                body: JSON.stringify(sprintData),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                toast.success('Sprint updated successfully!');
                onUpdateSprint();
                onClose();
            } else {
                toast.error(data.message || 'Failed to update sprint');
            }
        } catch (error) {
            toast.error('Error updating sprint');
            console.error('Error:', error);
        }
    };
    

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Edit Sprint Details</h2>
                    <div className="form-group">
                        <label>Sprint Name</label>
                        <input
                            type="text"
                            value={sprintName}
                            onChange={(e) => setSprintName(e.target.value)}
                            placeholder="Enter sprint name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Duration</label>
                        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="2 weeks">2 weeks</option>
                            <option value="3 weeks">3 weeks</option>
                            <option value="4 weeks">4 weeks</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" value={endDate} disabled />
                    </div>
                    <div className="modal-buttons">
                        <button className="save-btn" onClick={handleSave}>
                            Save
                        </button>
                        <button className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
                <ToastContainer />
            </div>
        )
    );
};

export default StartSprintModal;