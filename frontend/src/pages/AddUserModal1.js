import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../pages/css/AddUserModel.css';

function AddUserModal({ isOpen, projectId, onClose }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddUser = async () => {
        if (!email) {
            toast.error("Please enter a valid email");
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            console.log(email, projectId,token);
            const response = await fetch('http://localhost:8080/addUserToProject', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, projectId }),
            });

            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                toast.success('User added successfully!');
                onClose();
            } else {
                toast.error(data.message || 'Failed to add user');
            }
        } catch (error) {
            setIsLoading(false);
            toast.error('Error adding user');
            console.error('Error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add User to Project</h2>
                <input
                    type="email"
                    placeholder="Enter user's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleAddUser} disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add User'}
                    </button>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

export default AddUserModal;