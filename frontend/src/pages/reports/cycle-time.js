import React, { useState, useEffect } from "react";
import { Scatter } from "react-chartjs-2";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../pages/Header1";
import Sidebar from "../../pages/SideBar";
import "../../pages/css/Projects.css";
import "../../pages/css/Details.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function Cycletime() {
    const [userInfo, setUserInfo] = useState({ name: "", email: "", employeeId: "" });
    const [sprints, setSprints] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [completedTodayCount, setCompletedTodayCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { project, token } = location.state || {};

    useEffect(() => {
        if (!project) {
            console.error("No project data found. Redirecting to reports.");
            navigate("/reports");
        } else {
            fetchSprints(project._id);
        }

        const storedUser = localStorage.getItem("loggedInUser");
        if (storedUser) setUserInfo(JSON.parse(storedUser));
    }, [project, navigate]);

    const fetchSprints = async (projectId) => {
        try {
            const authToken = token || localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/sprints/${projectId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setSprints(data.sprints);
                computeCycleTimeData(data.sprints);
            } else {
                const errorMessage = await response.text();
                toast.error(errorMessage || "Failed to fetch sprints");
            }
        } catch (error) {
            console.error("Error fetching sprints:", error);
            toast.error("Error fetching sprints");
        }
    };

    const computeCycleTimeData = (sprints) => {
        if (!sprints || sprints.length === 0) return;

        const allSprintItems = sprints.flatMap(sprint => sprint.sprintItems || []);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const cycleTimes = allSprintItems
            .filter(item => item.completionDate)
            .map(item => {
                const createdDate = new Date(item.createdDate).toLocaleDateString();
                const completionDate = new Date(item.completionDate).toLocaleDateString();
                const cycleTime = Math.round((new Date(item.completionDate) - new Date(item.createdDate)) / (1000 * 60 * 60 * 24));

                const completionDateObj = new Date(item.completionDate);
                completionDateObj.setHours(0, 0, 0, 0);

                if (completionDateObj >= todayStart) {
                    setCompletedTodayCount(prevCount => prevCount + 1);
                }

                return {
                    x: createdDate,
                    y: cycleTime,
                    sprint: sprints.find(sprint => sprint._id === item.sprintId)?.sprintName || "Unknown Sprint",
                };
            });

        cycleTimes.sort((a, b) => new Date(a.x) - new Date(b.x));

        setChartData({
            datasets: [
                {
                    label: `Cycle Time for ${project?.projectName}`,
                    data: cycleTimes,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    pointRadius: 5,
                    parsing: {
                        xAxisKey: "x",
                        yAxisKey: "y",
                    },
                },
            ],
        });
    };

    return (
        <div className="layout-container">
            <Sidebar userInfo={userInfo} token={token || localStorage.getItem("token")} project={project} />
            <div className="main-content">
                <Header />
                <div className="right-container">
                    <div className="pwelcome-message">
                        <strong>{project?.projectName} - Cycle Time Chart</strong>
                    </div>

                    <div className="chart-container">
                        {chartData ? (
                            <>
                                <p>Sprints Completed Today: {completedTodayCount}</p>
                                <Scatter
                                    data={chartData}
                                    options={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: "Created Date",
                                                },
                                                type: "category",
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: "Cycle Time (Days)",
                                                },
                                                beginAtZero: true,
                                            },
                                        },
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: "top",
                                            },
                                        },
                                    }}
                                />
                            </>
                        ) : (
                            <p>Loading cycle time chart...</p>
                        )}
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Cycletime;