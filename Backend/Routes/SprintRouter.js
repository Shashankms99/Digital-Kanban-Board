const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const { createSprint, getSprints, getStartedSprints, completeSprint, changeSprintName, moveToNewSprint, moveToBacklogs } = require('../Controllers/SprintController');
const { sprintValidation } = require('../Middlewares/SprintValidation');
const mongoose = require('mongoose');
const Sprint = require('../Models/sprint');

router.post('/create', ensureAuthenticated, sprintValidation, createSprint);

router.get('/:projectId', ensureAuthenticated, getSprints);

router.get('/started/:projectId', ensureAuthenticated, getStartedSprints);

router.post('/complete/:sprintId', ensureAuthenticated, completeSprint);

router.post('/moveToNewSprint/:sprintId', ensureAuthenticated, moveToNewSprint);

 
router.put('/updateName/:sprintId', ensureAuthenticated, changeSprintName);

router.put('/update/:id', ensureAuthenticated, sprintValidation, async (req, res) => {
    const { id } = req.params;
    const { projectId, name, startDate, endDate, duration, status } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const sprint = await Sprint.findById(id);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const updatedSprint = await Sprint.findByIdAndUpdate(
            id,
            { name, startDate, endDate, duration, status, updatedDate: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedSprint) {
            return res.status(500).json({ message: 'Failed to update sprint' });
        }

        res.json({ message: 'Sprint updated successfully', sprint: updatedSprint });
    } catch (error) {
        console.error('Error updating sprint:', error);
        res.status(500).json({ message: 'Error updating sprint', error: error.message });
    }
});

module.exports = router;