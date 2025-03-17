import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../pages/Header1";
import Sidebar from "../../pages/SideBar";
import "../../pages/css/Projects.css";
import "../../pages/css/Details.css";
import "../../pages/css/cumulative-flow.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import { DatePicker } from "antd";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function Cumulativeflow() {
    const [userInfo, setUserInfo] = useState({ name: "", email: "", employeeId: "" });
    const [sprints, setSprints] = useState([]);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
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

    const generateCumulativeFlowData = () => {
        const todoCounts = [];
        const inProgressCounts = [];
        const doneCounts = [];
        const dates = [];
        const filteredItems = [];
        sprints.forEach((sprint) => {
            const sprintItems = sprint.sprintItems;
            sprintItems.forEach((item) => {
                const creationDate = new Date(item.createdDate);
                const statusChangedDate = new Date(item.updatedDate);
                const creationDateOnly = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate());
                const statusChangedDateOnly = new Date(statusChangedDate.getFullYear(), statusChangedDate.getMonth(), statusChangedDate.getDate());
                const fromDateValid = fromDate ? creationDateOnly >= new Date(fromDate) : true;
                const toDateValid = toDate ? statusChangedDateOnly <= new Date(toDate) : true;
    
                if (fromDateValid && toDateValid) {
                    filteredItems.push(item);
                }
            });
        });
    
        const allDates = new Set();
        filteredItems.forEach((item) => {
            const statusChangeDate = new Date(item.updatedDate).toISOString().split('T')[0];
            allDates.add(statusChangeDate);
        });
    
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    
        sortedDates.forEach((date) => {
            dates.push(date);
            let todoCount = 0;
            let inProgressCount = 0;
            let doneCount = 0;
    
            filteredItems.forEach((item) => {
                const itemDate = new Date(item.updatedDate).toISOString().split('T')[0];
                if (itemDate <= date) {
                    if (item.status === "To Do") {
                        todoCount++;
                    }
                    if (item.status === "In Progress") {
                        inProgressCount++;
                    }
                    if (item.status === "Done") {
                        doneCount++;
                    }
                }
            });
    
            todoCounts.push(todoCount);
            inProgressCounts.push(todoCounts[todoCounts.length - 1] + inProgressCount);
            doneCounts.push(inProgressCounts[inProgressCounts.length - 1] + doneCount);
        });
    
        setChartData({
            labels: dates,
            datasets: [
                {
                    label: "Done",
                    data: doneCounts,
                    backgroundColor: "rgba(75, 192, 192, 1)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    fill: 'origin',
                },
                {
                    label: "In Progress",
                    data: inProgressCounts,
                    backgroundColor: "rgba(54, 162, 235, 1)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    fill: 'origin',
                },
                {
                    label: "To Do",
                    data: todoCounts,
                    backgroundColor: "rgba(255, 99, 132, 1)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    fill: 'origin',
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
                        <strong>{project?.projectName} - Cumulative Flow Diagram</strong>
                    </div>

                    <div className="date-picker-container">
                        <label>From Date: </label>
                        <DatePicker
                            onChange={(date, dateString) => setFromDate(dateString)}
                            format="YYYY-MM-DD"
                        />
                        <label>To Date: </label>
                        <DatePicker
                            onChange={(date, dateString) => setToDate(dateString)}
                            format="YYYY-MM-DD"
                        />
                        <button onClick={generateCumulativeFlowData}>Generate Chart</button>
                    </div>

                    {!chartData ? (
                        <div className="placeholder-container">
                            <p>Select a date range and click 'Generate Chart' to view the Cumulative Flow Diagram.</p>
                        </div>
                    ) : (
                        <div className="chart-container">
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: "top" },
                                        title: {
                                            display: true,
                                            text: "Cumulative Flow Diagram (To Do, In Progress, Done)",
                                        },
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: "Date",
                                            },
                                        },
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: "Number of Items",
                                            },
                                            stacked: true,
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

export default Cumulativeflow;