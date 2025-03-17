import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../pages/css/CreateProject.css';
import Header from '../pages/Header1';
import Sidebar from '../pages/SideBar1';

function AddUser1() {
    const [email, setEmail] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId } = location.state || {}; 

    const handleAddUser = async () => {
        if (!email) {
            toast.error("Please enter a valid email");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/adduser/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, projectId }), 
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("User added to project successfully");
                setEmail(''); 
            } else {
                toast.error(data.message || "Error adding user to project");
            }
        } catch (error) {
            toast.error("Error adding user to project");
            console.error('Error:', error);
        }
    };

    const handleCancel = () => {
        navigate(-2);
    };

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="create-project-wrapper"> 
                    <div className="create-project-container">
                        <h1>Add User to Project</h1>
                        <div className="form-group"> 
                            <input
                                type="email"
                                placeholder="Enter user email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button onClick={handleAddUser} className="add-user-button">Add User</button>
                        <button onClick={handleCancel} className="cancel-button">Cancel</button>
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default AddUser1;