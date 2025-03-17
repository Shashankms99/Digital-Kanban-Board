import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import logo from '../assets/logo.png';
import '../pages/css/Header.css';

function Header() {
    const [userInfo, setUserInfo] = useState({ name: '', email: '', employeeId: '' });
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Logged out');
        setTimeout(() => navigate('/login'), 1000);
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="Company Logo" className="header-logo" />
                <h1 className="header-title">KANEXUS</h1>
            </div>
            <div className="user-icon" onClick={toggleDropdown}>
                {userInfo.name && <span>{userInfo.name[0].toUpperCase()}</span>}
                {dropdownVisible && (
                    <div className="user-dropdown">
                        <div className="dropdown-header">
                            <div className="icon-large">
                                {userInfo.name && userInfo.name[0].toUpperCase()}
                            </div>
                            <p>{userInfo.name}</p>
                        </div>
                        <p>Email: {userInfo.email}</p>
                        <p>Employee ID: {userInfo.employeeId}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;