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
            console.log(email, projectId, token);
            const response = await fetch('http://localhost:8080/adduser/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, projectId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "User added to project successfully");
                setEmail('');
            } else {
                toast.error(data.message || "Error adding user to project");
            }
        } catch (error) {
            toast.error("Error adding user to project");
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEmail('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add User to Project</h2>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Enter user email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="modal-buttons">
                    <button 
                        onClick={handleAddUser} 
                        disabled={isLoading} 
                        className="add-user-button"
                    >
                        {isLoading ? 'Adding...' : 'Add User'}
                    </button>
                    <button onClick={handleCancel} className="cancel-button">Cancel</button>
                </div>
                <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </div>
        </div>
    );
}

export default AddUserModal;