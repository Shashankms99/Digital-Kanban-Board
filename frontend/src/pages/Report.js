import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from '../pages/Header1';
import Sidebar from '../pages/SideBar';
import '../pages/css/Reports.css';

function Reports() {
    const location = useLocation();
    const navigate = useNavigate();

    const { project, userInfo = {}, token } = location.state || {};

    useEffect(() => {
        if (!project) {
            console.error('No project data found. Redirecting to projects.');
            navigate('/projects');
        }
    }, [project, navigate]);

    if (!project) return null;

    const chartOptions = [
        {
            name: 'Sprint Burn Up Chart',
            description: 'Shows completed and remaining work in a sprint over time.',
            route: '/reports/sprint-burn-up',
            image: '/images/sprint-burn-up.png',
        },
        {
            name: 'Sprint Burn Down Chart',
            description: 'Tracks remaining work in a sprint, indicating progress.',
            route: '/reports/sprint-burn-down',
            image: '/images/sprint-burn-down.png',
        },
        {
            name: 'Velocity Report',
            description: 'Displays the amount of work completed per sprint.',
            route: '/reports/velocity-report',
            image: '/images/velocity-report.png',
        },
        {
            name: 'Cycle Time Report',
            description: 'Analyzes the time taken for work items to complete.',
            route: '/reports/cycle-time',
            image: '/images/cycle-time.png',
        },
        {
            name: 'Cumulative Flow Diagram',
            description: 'Visualizes workflow states to identify bottlenecks.',
            route: '/reports/cumulative-flow',
            image: '/images/cumulative-flow.png',
        },
    ];

    const handleNavigation = (route) => {
        navigate(route, { state: { project, userInfo, token } });
    };

    return (
        <div className="layout-container">
            <Sidebar userInfo={userInfo} token={token || localStorage.getItem('token')} project={project} />
            <div className="main-content">
                <Header />
                <div className="right-container">
                    <div className="backlog-top">
                        <h2>{project.projectName}</h2>
                        <h1>Reports</h1>
                    </div>
                    <div className="charts-grid">
                        {chartOptions.map((chart, index) => (
                            <div
                                key={index}
                                className="chart-box"
                                onClick={() => handleNavigation(chart.route)}
                            >
                                <div className="chart-box-inner">
                                    <div className="chart-box-front">
                                        <h3>{chart.name}</h3>
                                    </div>
                                    <div className="chart-box-back">
                                        <img src={chart.image} alt={chart.name} />
                                        <p>{chart.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Reports;