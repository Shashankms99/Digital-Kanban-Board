const { createBacklog } = require('../Controllers/BacklogController');
const { createBacklogValidation } = require('../Middlewares/BacklogValidation');
const ensureAuthenticated = require('../Middlewares/Auth'); 
const BacklogModel = require('../Models/backlog');

const router = require('express').Router();

router.post('/createissue', ensureAuthenticated, createBacklogValidation, createBacklog);

router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const issue = await BacklogModel.findById(req.params.id);
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue details' });
    }
});

router.put('/update/:id', ensureAuthenticated, async (req, res) => {
    try {
        const updatedIssue = await BacklogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Error updating issue' });
    }
});

router.delete('/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: 'Backlog ID is required' });
        }

        const backlogItem = await BacklogModel.findByIdAndDelete(id);
        if (!backlogItem) {
            return res.status(404).json({ message: 'Backlog item not found' });
        }

        res.status(200).json({ message: 'Backlog item deleted successfully' });
    } catch (error) {
        console.error('Error during delete operation:', error);
        res.status(500).json({ message: 'Error deleting backlog item', error: error.message });
    }
});


module.exports = router;