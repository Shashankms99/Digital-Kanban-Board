const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const { createSprintItem, getSprintItems } = require('../Controllers/SprintItemsController');
const { sprintItemsValidation } = require('../Middlewares/SprintItemsValidation');
const SprintItemModel = require('../Models/sprintitems');
const BacklogModel = require('../Models/backlog');

router.post('/:sprintId/create', ensureAuthenticated, sprintItemsValidation, createSprintItem);

router.get('/:sprintitemid', ensureAuthenticated, getSprintItems);

router.get('/getsubdata/:sprintitemid', ensureAuthenticated, async(req, res) => {
    try {
        const { sprintitemid } = req.params;
        console.log('Fetching sprint items for ID:', sprintitemid);

        const sprintItem = await SprintItemModel.findOne({ _id: sprintitemid })
            .populate('parent', 'summary') 
            .populate('child', 'summary');  

        if (!sprintItem) {
            return res.status(404).json({ message: 'Sprint item not found', success: false });
        }

        const parentSummary = sprintItem.parent ? sprintItem.parent.summary : null;
        const childSummaries = sprintItem.child.map(child => child.summary);

        res.status(200).json({
            success: true,
            parentSummary,
            childSummaries
        });

    } catch (err) {
        console.error('Error fetching sprint items:', err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
});

router.get('/getsubbacklogdata/:backlogid', ensureAuthenticated, async(req, res) => {
    try {
        const { backlogid } = req.params;
        console.log('Fetching backlog for ID:', backlogid);

        const backlog = await BacklogModel.findOne({ _id: backlogid })
            .populate('parent', 'summary') 
            .populate('child', 'summary');  

        if (!backlog) {
            return res.status(404).json({ message: 'Backlog not found', success: false });
        }

        const parentSummary = backlog.parent ? backlog.parent.summary : null;
        const childSummaries = backlog.child.map(child => child.summary);

        res.status(200).json({
            success: true,
            parentSummary,
            childSummaries
        });

    } catch (err) {
        console.error('Error fetching backlog:', err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
});


router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const issue = await SprintItemModel.findById(req.params.id);
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue details' });
    }
});

router.put('/updatestatus/:id', ensureAuthenticated, async (req, res) => {
    try {
        if (!req.body.status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const updatedSprintItem = await SprintItemModel.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true } 
        );

        if (!updatedSprintItem) {
            return res.status(404).json({ message: `Sprint item with ID ${req.params.id} not found` });
        }

        return res.status(200).json(updatedSprintItem);
    } catch (error) {
        console.error('Error updating sprint item:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid Sprint Item ID: ${req.params.id}` });
        }

        if (!res.headersSent) {
            return res.status(500).json({ message: 'An error occurred while updating the sprint item. Please try again later.' });
        }
    }
});

router.put('/update/:id', ensureAuthenticated, async (req, res) => {
    try {
        if (!req.body.status || !req.body.summary || !req.body.issueType) {
            return res.status(400).json({ message: 'Status, Summary, and Issue Type are required' });
        }

        const updatedSprintItem = await SprintItemModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedSprintItem) {
            return res.status(404).json({ message: `Sprint item with ID ${req.params.id} not found` });
        }

        return res.status(200).json(updatedSprintItem);
    } catch (error) {
        console.error('Error updating sprint item:', error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid Sprint Item ID: ${req.params.id}` });
        }

        if (!res.headersSent) {
            return res.status(500).json({ message: 'An error occurred while updating the sprint item. Please try again later.' });
        }
    }
});


module.exports = router;