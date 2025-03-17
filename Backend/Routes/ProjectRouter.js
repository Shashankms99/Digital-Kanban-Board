const express = require('express');
const router = express.Router();
const ProjectModel = require('../Models/project');
const ensureAuthenticated = require('../Middlewares/Auth'); 

router.get('/:projectId/members', ensureAuthenticated, async (req, res) => {
    try {
        const projectId = req.params.projectId;

        const project = await ProjectModel.findById(projectId).populate('members');

        console.log('Project data:', project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
                success: false,
            });
        }

        res.status(200).json({
            success: true,
            members: project.members
        });
    } catch (err) {
        console.error('Error fetching project members:', err);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false,
            error: err.message,
        });
    }
});

router.get('/:projectId/backlogs', ensureAuthenticated, async (req, res) => {
    try {
        const projectId = req.params.projectId;

        console.log('Received projectId:', projectId);

        const project = await ProjectModel.findById(projectId).populate('backlogs');

        console.log('Project data:', project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
                success: false,
            });
        }

        res.status(200).json({
            success: true,
            backlogs: project.backlogs
        });
    } catch (err) {
        console.error('Error fetching project backlogs:', err);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false,
            error: err.message,
        });
    }
});

router.patch('/:projectId/removeBacklog/:backlogId', async (req, res) => {
    try {
        const { projectId, backlogId } = req.params;
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.backlogs = project.backlogs.filter(b => b.toString() !== backlogId);
        await project.save();

        res.status(200).json({ message: 'Backlog removed from project' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing backlog from project' });
    }
});

module.exports = router;