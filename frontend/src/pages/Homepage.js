import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import './css/Homepage.css'; 

function Homepage() {
    const navigate = useNavigate();

    const handleGetStarted = (e) => {
        createStarSparkles(e); 
        setTimeout(() => navigate('/login'), 500); 
    };

    const createStarSparkles = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();

        for (let i = 0; i < 8; i++) { 
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * rect.width}px`;
            sparkle.style.top = `${Math.random() * rect.height}px`;

            button.appendChild(sparkle);

            
            sparkle.addEventListener('animationend', () => sparkle.remove());
        }
    };

    return (
        <div className="homepage">
            <header className="homepage-header">
                <img src={logo} alt="Company Logo" className="homepage-logo" />
                <h1>Welcome to KANEXUS</h1>
            </header>

            <div className="homepage-content">
                <br />
                <p>Manage your tasks efficiently with our real-time Kanban Board tool!</p>
                <br />
                <p>
                    Kanban is a visual workflow management method used to optimize production
                    and operations. It helps teams visualize work, limit work-in-progress (WIP), 
                    and maximize flow efficiency.
                </p>
                <p>
                    <br />
                    <br />
                    Here you will be able to create projects, manage task flow, customize Kanban
                    cards, see reports, etc.
                </p>
                <button className="get-started-btn" onClick={handleGetStarted}>
                    Get Started
                </button>
            </div>
        </div>
    );
}

export default Homepage;
