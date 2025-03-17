import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import '../pages/css/SideBar.css';

function Sidebar({ userInfo, token, project }) { 
    const [userDetails, setUserDetails] = useState({ name: '', email: '', employeeId: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUserDetails(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">{project ? project.projectName : 'Projects'}</h2>
            <nav className="sidebar-nav">
                <Link to="/board" state={{ userInfo, token, project }} className="sidebar-link">Board</Link>
                <Link to="/backlog" state={{ userInfo, token, project }} className="sidebar-link">Backlog</Link>
                <Link to="/reports" state={{ userInfo, token, project }} className="sidebar-link">Reports</Link>
            </nav>
        </div>
    );
}

export default Sidebar;