import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
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
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function Sprintburnup() {
    const [userInfo, setUserInfo] = useState({ name: "", email: "", employeeId: "" });
    const [sprints, setSprints] = useState([]);
    const [selectedSprint, setSelectedSprint] = useState(null);
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
            } else {
                const errorMessage = await response.text();
                toast.error(errorMessage || "Failed to fetch sprints");
            }
        } catch (error) {
            console.error("Error fetching sprints:", error);
            toast.error("Error fetching sprints");
        }
    };

    const handleSprintChange = (e) => {
        const sprint = sprints.find((s) => s._id === e.target.value);
        setSelectedSprint(sprint);
        if (sprint) generateBurnupChartData(sprint);
    };

    const generateBurnupChartData = (sprint) => {
        const { startDate, endDate, sprintItems } = sprint;
        const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

        const dates = [];
        const totalStoryPoints = sprintItems.reduce((acc, item) => acc + item.storyPoints, 0);
        const completedStoryPoints = new Array(totalDays).fill(0);

        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() + i));
            dates.push(currentDate.toLocaleDateString());
            completedStoryPoints[i] = sprintItems
                .filter((item) => item.status === "Done" && new Date(item.completionDate) <= currentDate)
                .reduce((acc, item) => acc + item.storyPoints, 0);
        }

        setChartData({
            labels: dates,
            datasets: [
                {
                    label: "Total Scope",
                    data: Array(totalDays).fill(totalStoryPoints),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderDash: [5, 5],
                },
                {
                    label: "Work Completed",
                    data: completedStoryPoints,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    stepped: true,
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
                        <strong>{project?.projectName} - Sprint Burnup Chart</strong>
                    </div>
                    <div className="dropdown-container">
                        <label htmlFor="sprint-select">Select Sprint:</label>
                        <select
                            id="sprint-select"
                            value={selectedSprint?._id || ""}
                            onChange={handleSprintChange}
                            disabled={!sprints.length}
                        >
                            <option value="" disabled>
                                -- Select a Sprint --
                            </option>
                            {sprints.map((sprint) => (
                                <option key={sprint._id} value={sprint._id}>
                                    {sprint.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {!selectedSprint ? (
                        <div className="placeholder-container">
                            <p>Select a sprint to view its burnup chart.</p>
                        </div>
                    ) : (
                        <div className="chart-container">
                            {chartData && (
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: "top" },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    )}
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Sprintburnup;