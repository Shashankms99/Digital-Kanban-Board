import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
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
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Velocityreport() {
    const [userInfo, setUserInfo] = useState({ name: "", email: "", employeeId: "" });
    const [sprints, setSprints] = useState([]);
    const [chartData, setChartData] = useState(null);
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
                generateVelocityReportData(data.sprints);
            } else {
                const errorMessage = await response.text();
                toast.error(errorMessage || "Failed to fetch sprints");
            }
        } catch (error) {
            console.error("Error fetching sprints:", error);
            toast.error("Error fetching sprints");
        }
    };

    const generateVelocityReportData = (sprints) => {
        const sprintLabels = [];
        const committedStoryPoints = [];
        const completedStoryPoints = [];

        sprints.forEach((sprint) => {
            sprintLabels.push(sprint.name);
            const totalCommittedPoints = sprint.sprintItems.reduce(
                (acc, item) => acc + item.storyPoints,
                0
            );
            committedStoryPoints.push(totalCommittedPoints);
            const totalCompletedPoints = sprint.sprintItems
                .filter((item) => item.status === "Done")
                .reduce((acc, item) => acc + item.storyPoints, 0);
            completedStoryPoints.push(totalCompletedPoints);
        });

        setChartData({
            labels: sprintLabels,
            datasets: [
                {
                    label: "Committed Story Points",
                    data: committedStoryPoints,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Completed Story Points",
                    data: completedStoryPoints,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
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
                        <strong>{project?.projectName} - Velocity Report</strong>
                    </div>

                    {!chartData ? (
                        <div className="placeholder-container">
                            <p>Loading velocity data...</p>
                        </div>
                    ) : (
                        <div className="chart-container">
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: "top" },
                                        title: {
                                            display: true,
                                            text: "Velocity Report (Committed vs Completed Story Points)",
                                        },
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: "Sprint",
                                            },
                                        },
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: "Story Points",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Velocityreport;