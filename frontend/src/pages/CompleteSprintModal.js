import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "../pages/css/CreateIssueModal.css";

const CompleteSprintModal = ({
    isOpen,
    onClose,
    sprint,
    onUpdateSprint,
    token,
}) => {
    const [doneCount, setDoneCount] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    const [toDoCount, setToDoCount] = useState(0);

    useEffect(() => {
        if (sprint && sprint.sprintItems) {
            const doneItems = sprint.sprintItems.filter(
                (item) => item.status === "Done"
            ).length;
            const inProgressItems = sprint.sprintItems.filter(
                (item) => item.status === "In Progress"
            ).length;
            const toDoItems = sprint.sprintItems.filter(
                (item) => item.status === "To Do"
            ).length;

            setDoneCount(doneItems);
            setInProgressCount(inProgressItems);
            setToDoCount(toDoItems);
        }
    }, [sprint]);

    const handleCompleteSprint = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/sprints/complete/${sprint._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Sprint completed successfully!");
                onUpdateSprint();
                onClose();
            } else {
                toast.error(data.message || "Failed to complete sprint");
            }
        } catch (error) {
            toast.error("Error completing sprint");
            console.error("Error:", error);
        }
    };
    const handleMoveToNewSprint = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/sprints/moveToNewSprint/${sprint._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
                    },
                }
            );
    
            const data = await response.json();
    
            if (response.ok) {
                toast.success("Sprint items moved to a new sprint successfully!");
                onUpdateSprint();
                onClose();
            } else {
                toast.error(data.message || "Failed to move items to a new sprint");
            }
        } catch (error) {
            toast.error("Error moving items to a new sprint");
            console.error("Error:", error);
        }
    };
    
    

    const hasIncompleteItems = inProgressCount > 0 || toDoCount > 0;

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Complete Sprint</h2>
                    <p>Review the status of sprint items</p>
                    <div className="sprint-summary">
                    <p>
                            <strong>Total Number of issues :</strong> {toDoCount+doneCount+inProgressCount}
                        </p>
                        <p>
                            <strong>The number of completed issues :</strong> {doneCount}
                        </p>
                        <p>
                            <strong>The number of incomplete issues :</strong> {inProgressCount + toDoCount}
                        </p>
                        <div>
                        {hasIncompleteItems ? (
                            <p>
                            Choose the appropriate action for incomplete issues
                            </p>
                           
                        ) : (
                            <p></p>
                        )}
                       
                        </div>
                    </div>
                    <div className="modal-buttons">
                        {hasIncompleteItems ? (
                            <>
                            
                                <button className="move-btn" onClick={handleMoveToNewSprint}>
                                    Move to New Sprint
                                </button>
                                
                            </>
                        ) : (
                            <button className="complete-btn" onClick={handleCompleteSprint}>
                                Complete Sprint
                            </button>
                        )}
                        <button className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
                <ToastContainer />
            </div>
        )
    );
};

export default CompleteSprintModal;